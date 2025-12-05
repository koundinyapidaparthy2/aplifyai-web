/**
 * Application Prediction Service
 * 
 * Provides application success predictions with:
 * - Match score (0-100)
 * - Success probability
 * - Confidence intervals
 * - Feature breakdown
 * - Comparison to successful applications
 */

class ApplicationPredictionService {
  constructor() {
    this.model = new ApplicationSuccessModel();
    this.featureService = new FeatureEngineeringService();
    this.modelLoaded = false;
  }

  /**
   * Initialize service (load model)
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (this.modelLoaded) {
      return true;
    }
    
    try {
      const loaded = await this.model.loadModel();
      
      if (!loaded) {
        console.warn('[Prediction] Model not found. Train model first.');
        return false;
      }
      
      this.modelLoaded = true;
      console.log('[Prediction] Service initialized');
      return true;
    } catch (error) {
      console.error('[Prediction] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Predict application success
   * @param {Object} jobPosting - Job posting data
   * @param {Object} resume - User's resume
   * @param {Object} applicationContext - Application timing/context
   * @returns {Promise<Object>} Prediction result with detailed breakdown
   */
  async predictApplicationSuccess(jobPosting, resume, applicationContext = {}) {
    // Ensure model is loaded
    if (!this.modelLoaded) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Model not trained. Please collect training data and train the model first.');
      }
    }
    
    console.log('[Prediction] Predicting for:', jobPosting.title, 'at', jobPosting.company);
    
    // Extract features
    const features = this.featureService.extractFeatures(
      jobPosting,
      resume,
      applicationContext
    );
    
    // Make prediction
    const prediction = await this.model.predict(features);
    
    // Calculate confidence interval
    const confidenceInterval = this.calculateConfidenceInterval(
      prediction.probability,
      prediction.confidence
    );
    
    // Feature breakdown (which features contribute most)
    const featureBreakdown = this.analyzeFeatureContributions(features);
    
    // Compare to successful applications
    const comparison = await this.compareToSuccessfulApplications(features);
    
    // Get recommendation
    const recommendation = this.getRecommendation(prediction, featureBreakdown);
    
    return {
      // Core prediction
      matchScore: prediction.matchScore,
      probability: prediction.probability,
      confidence: prediction.confidence,
      predictedOutcome: prediction.predictedLabel,
      
      // Confidence interval
      confidenceInterval,
      
      // Feature breakdown
      features,
      featureBreakdown,
      
      // Comparison
      comparison,
      
      // Recommendation
      recommendation,
      
      // Metadata
      predictedAt: new Date().toISOString(),
      modelVersion: this.model.metadata.version
    };
  }

  /**
   * Batch predict for multiple jobs
   * @param {Array} jobPostings - Array of job postings
   * @param {Object} resume - User's resume
   * @returns {Promise<Array>} Array of predictions
   */
  async batchPredict(jobPostings, resume) {
    if (!this.modelLoaded) {
      await this.initialize();
    }
    
    console.log(`[Prediction] Batch prediction for ${jobPostings.length} jobs`);
    
    const predictions = [];
    
    for (const jobPosting of jobPostings) {
      try {
        const prediction = await this.predictApplicationSuccess(
          jobPosting,
          resume,
          { applicationDate: new Date() }
        );
        
        predictions.push({
          jobId: jobPosting.id,
          jobTitle: jobPosting.title,
          company: jobPosting.company,
          ...prediction
        });
      } catch (error) {
        console.warn(`[Prediction] Failed for ${jobPosting.title}:`, error);
        predictions.push({
          jobId: jobPosting.id,
          jobTitle: jobPosting.title,
          company: jobPosting.company,
          error: error.message
        });
      }
    }
    
    // Sort by match score descending
    predictions.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    return predictions;
  }

  /**
   * Get match score before applying
   * @param {Object} jobPosting - Job posting
   * @param {Object} resume - User's resume
   * @returns {Promise<Object>} Quick match score
   */
  async getQuickMatchScore(jobPosting, resume) {
    const prediction = await this.predictApplicationSuccess(jobPosting, resume);
    
    return {
      matchScore: prediction.matchScore,
      recommendation: this.getQuickRecommendation(prediction.matchScore),
      topStrengths: prediction.featureBreakdown.strengths.slice(0, 3),
      topWeaknesses: prediction.featureBreakdown.weaknesses.slice(0, 3)
    };
  }

  /**
   * Calculate confidence interval for probability
   * @param {number} probability - Predicted probability
   * @param {number} confidence - Model confidence
   * @returns {Object} Confidence interval
   */
  calculateConfidenceInterval(probability, confidence) {
    // Wider interval for lower confidence
    const margin = (1 - confidence) * 0.3; // 0 to 0.3
    
    const lower = Math.max(0, probability - margin);
    const upper = Math.min(1, probability + margin);
    
    return {
      lower: Number(lower.toFixed(3)),
      upper: Number(upper.toFixed(3)),
      margin: Number(margin.toFixed(3)),
      level: 0.95 // 95% confidence level
    };
  }

  /**
   * Analyze feature contributions to prediction
   * @param {Object} features - Feature object
   * @returns {Object} Feature analysis
   */
  analyzeFeatureContributions(features) {
    const featureNames = this.featureService.getFeatureNames();
    const featureImportance = this.featureService.getFeatureImportance();
    
    // Calculate weighted contributions
    const contributions = [];
    
    for (const [name, description] of Object.entries(featureNames)) {
      const value = features[name];
      
      // Skip non-numeric features
      if (typeof value !== 'number') continue;
      
      const importance = featureImportance[name] || 0;
      const contribution = value * importance;
      
      contributions.push({
        name,
        description,
        value: Number(value.toFixed(3)),
        importance: Number(importance.toFixed(3)),
        contribution: Number(contribution.toFixed(4)),
        category: this.categorizeFeature(name)
      });
    }
    
    // Sort by absolute contribution
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    
    // Identify strengths and weaknesses
    const strengths = contributions
      .filter(c => c.value >= 0.7) // High value features
      .slice(0, 5);
    
    const weaknesses = contributions
      .filter(c => c.value < 0.5) // Low value features
      .sort((a, b) => b.importance - a.importance) // Prioritize important features
      .slice(0, 5);
    
    return {
      all: contributions,
      strengths,
      weaknesses,
      topContributors: contributions.slice(0, 10),
      categories: this.groupByCategory(contributions)
    };
  }

  /**
   * Compare to successful applications
   * @param {Object} features - Feature object
   * @returns {Promise<Object>} Comparison result
   */
  async compareToSuccessfulApplications(features) {
    // Get successful applications from training data
    const trainingData = new TrainingDataService();
    const successfulRecords = await trainingData.getRecordsByOutcome('interview');
    
    if (successfulRecords.length === 0) {
      return {
        available: false,
        message: 'No successful applications available for comparison'
      };
    }
    
    // Extract features from successful applications
    const successfulFeatures = successfulRecords
      .slice(0, 10) // Top 10 recent
      .map(record => {
        try {
          return this.featureService.extractFeatures(
            record.jobPosting,
            record.resume,
            record.applicationContext
          );
        } catch (error) {
          return null;
        }
      })
      .filter(f => f !== null);
    
    if (successfulFeatures.length === 0) {
      return {
        available: false,
        message: 'Could not extract features from successful applications'
      };
    }
    
    // Calculate average feature values for successful applications
    const avgSuccessfulFeatures = this.calculateAverageFeatures(successfulFeatures);
    
    // Compare current application to average successful
    const comparison = {};
    const featureNames = Object.keys(features).filter(k => typeof features[k] === 'number');
    
    for (const name of featureNames) {
      const currentValue = features[name];
      const avgValue = avgSuccessfulFeatures[name] || 0;
      const diff = currentValue - avgValue;
      
      comparison[name] = {
        current: Number(currentValue.toFixed(3)),
        avgSuccessful: Number(avgValue.toFixed(3)),
        difference: Number(diff.toFixed(3)),
        percentDiff: avgValue !== 0 ? Number(((diff / avgValue) * 100).toFixed(1)) : 0,
        betterThanAverage: diff >= 0
      };
    }
    
    // Identify significant gaps
    const significantGaps = Object.entries(comparison)
      .filter(([_, comp]) => comp.difference < -0.2) // 20% below average
      .sort((a, b) => a[1].difference - b[1].difference)
      .slice(0, 5)
      .map(([name, comp]) => ({
        feature: name,
        ...comp
      }));
    
    return {
      available: true,
      comparison,
      significantGaps,
      successfulCount: successfulFeatures.length,
      overallMatch: this.calculateOverallMatch(comparison)
    };
  }

  /**
   * Get recommendation based on prediction
   * @param {Object} prediction - Prediction result
   * @param {Object} featureBreakdown - Feature breakdown
   * @returns {Object} Recommendation
   */
  getRecommendation(prediction, featureBreakdown) {
    const score = prediction.matchScore;
    
    let level, message, action;
    
    if (score >= 80) {
      level = 'excellent';
      message = 'Excellent match! You have a strong chance of success.';
      action = 'Apply immediately and craft a tailored cover letter highlighting your top strengths.';
    } else if (score >= 65) {
      level = 'good';
      message = 'Good match. You have a solid chance with some improvements.';
      action = 'Apply, but address the identified weaknesses in your cover letter or by updating your resume.';
    } else if (score >= 50) {
      level = 'moderate';
      message = 'Moderate match. Consider improving key areas before applying.';
      action = 'Review the weaknesses and decide if you can address them. Consider gaining missing skills or experience first.';
    } else {
      level = 'low';
      message = 'Low match. Significant gaps exist between your profile and job requirements.';
      action = 'Focus on positions that better match your current skills, or work on developing the missing skills before applying.';
    }
    
    return {
      level,
      score,
      message,
      action,
      strengths: featureBreakdown.strengths,
      weaknesses: featureBreakdown.weaknesses
    };
  }

  /**
   * Get quick recommendation based on match score
   * @param {number} score - Match score (0-100)
   * @returns {string} Quick recommendation
   */
  getQuickRecommendation(score) {
    if (score >= 80) return '🟢 Strong Match - Apply Now!';
    if (score >= 65) return '🟡 Good Match - Worth Applying';
    if (score >= 50) return '🟠 Moderate Match - Consider Improvements';
    return '🔴 Low Match - Proceed with Caution';
  }

  /**
   * Categorize feature into group
   * @param {string} featureName - Feature name
   * @returns {string} Category
   */
  categorizeFeature(featureName) {
    if (featureName.includes('skill')) return 'Skills';
    if (featureName.includes('experience') || featureName.includes('seniority')) return 'Experience';
    if (featureName.includes('education') || featureName.includes('gpa')) return 'Education';
    if (featureName.includes('location') || featureName.includes('remote')) return 'Location';
    if (featureName.includes('application') || featureName.includes('timing') || featureName.includes('day')) return 'Timing';
    if (featureName.includes('similarity') || featureName.includes('keyword')) return 'Text Match';
    if (featureName.includes('company') || featureName.includes('job')) return 'Job Characteristics';
    return 'Other';
  }

  /**
   * Group contributions by category
   * @param {Array} contributions - Contribution array
   * @returns {Object} Grouped by category
   */
  groupByCategory(contributions) {
    const grouped = {};
    
    for (const contrib of contributions) {
      const category = contrib.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(contrib);
    }
    
    // Calculate category average scores
    const categoryScores = {};
    for (const [category, items] of Object.entries(grouped)) {
      const avgValue = items.reduce((sum, item) => sum + item.value, 0) / items.length;
      categoryScores[category] = {
        score: Number(avgValue.toFixed(3)),
        count: items.length,
        items: items.slice(0, 3) // Top 3 per category
      };
    }
    
    return categoryScores;
  }

  /**
   * Calculate average features from multiple feature objects
   * @param {Array} featuresArray - Array of feature objects
   * @returns {Object} Average features
   */
  calculateAverageFeatures(featuresArray) {
    const avg = {};
    const counts = {};
    
    for (const features of featuresArray) {
      for (const [name, value] of Object.entries(features)) {
        if (typeof value === 'number') {
          avg[name] = (avg[name] || 0) + value;
          counts[name] = (counts[name] || 0) + 1;
        }
      }
    }
    
    for (const name of Object.keys(avg)) {
      avg[name] /= counts[name];
    }
    
    return avg;
  }

  /**
   * Calculate overall match to successful applications
   * @param {Object} comparison - Feature comparison
   * @returns {number} Overall match score (0-1)
   */
  calculateOverallMatch(comparison) {
    const features = Object.values(comparison);
    const betterCount = features.filter(f => f.betterThanAverage).length;
    return Number((betterCount / features.length).toFixed(3));
  }

  /**
   * Get prediction history for user
   * @returns {Promise<Array>} Prediction history
   */
  async getPredictionHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['prediction_history'], (result) => {
        resolve(result.prediction_history || []);
      });
    });
  }

  /**
   * Save prediction to history
   * @param {Object} prediction - Prediction result
   * @returns {Promise<void>}
   */
  async savePrediction(prediction) {
    const history = await this.getPredictionHistory();
    
    history.push({
      ...prediction,
      id: `pred_${Date.now()}`,
      savedAt: new Date().toISOString()
    });
    
    // Keep last 100 predictions
    const trimmed = history.slice(-100);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ prediction_history: trimmed }, resolve);
    });
  }

  /**
   * Get model performance metrics
   * @returns {Object} Performance metrics
   */
  getModelPerformance() {
    if (!this.model.metadata.performance) {
      return {
        available: false,
        message: 'Model performance metrics not available'
      };
    }
    
    return {
      available: true,
      ...this.model.metadata.performance,
      trainedAt: this.model.metadata.trainedAt,
      trainingSize: this.model.metadata.trainingSize
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApplicationPredictionService;
}
