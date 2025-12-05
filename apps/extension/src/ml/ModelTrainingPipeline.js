/**
 * Model Training Pipeline
 * 
 * Orchestrates the complete ML training workflow:
 * 1. Data collection and validation
 * 2. Feature engineering
 * 3. Train/validation split
 * 4. Model training with hyperparameter tuning
 * 5. Model evaluation
 * 6. Model persistence
 * 7. Performance monitoring
 */

class ModelTrainingPipeline {
  constructor() {
    this.trainingDataService = new TrainingDataService();
    this.featureService = new FeatureEngineeringService();
    this.model = new ApplicationSuccessModel();
    
    this.pipelineConfig = {
      minSamples: 30,
      validationSplit: 0.2,
      epochs: 100,
      batchSize: 32,
      earlyStoppingPatience: 10,
      hyperparameterTuning: false
    };
    
    this.trainingStatus = {
      isRunning: false,
      currentStage: null,
      progress: 0,
      error: null
    };
  }

  /**
   * Run complete training pipeline
   * @param {Object} options - Pipeline options
   * @returns {Promise<Object>} Training results
   */
  async runPipeline(options = {}) {
    if (this.trainingStatus.isRunning) {
      throw new Error('Training pipeline is already running');
    }
    
    this.trainingStatus = {
      isRunning: true,
      currentStage: 'initialization',
      progress: 0,
      error: null
    };
    
    const startTime = Date.now();
    
    try {
      console.log('[Pipeline] Starting ML training pipeline');
      
      // Merge options with defaults
      const config = { ...this.pipelineConfig, ...options };
      
      // Stage 1: Data collection and validation
      this.updateStatus('data_collection', 10);
      const dataStats = await this.trainingDataService.getDatasetStatistics();
      console.log('[Pipeline] Dataset statistics:', dataStats);
      
      if (!dataStats.readyForTraining) {
        throw new Error(
          `Insufficient training data: ${dataStats.completedApplications} samples ` +
          `(minimum: ${config.minSamples}). Need ${dataStats.samplesNeeded} more.`
        );
      }
      
      // Stage 2: Data quality validation
      this.updateStatus('data_validation', 20);
      const validation = await this.trainingDataService.validateDataQuality();
      console.log('[Pipeline] Data quality:', validation.quality);
      
      if (!validation.isValid) {
        console.warn('[Pipeline] Data quality issues detected:', validation.issues);
      }
      
      // Stage 3: Data cleaning
      this.updateStatus('data_cleaning', 30);
      const cleaned = await this.trainingDataService.cleanDataForTraining();
      console.log('[Pipeline] Cleaned data:', cleaned.stats);
      
      // Stage 4: Feature engineering
      this.updateStatus('feature_engineering', 40);
      const dataset = await this.trainingDataService.getTrainingDataset();
      console.log('[Pipeline] Extracted features for', dataset.features.length, 'samples');
      console.log('[Pipeline] Success rate:', (dataset.metadata.successRate * 100).toFixed(1) + '%');
      
      // Convert feature objects to arrays
      const featureArrays = dataset.features.map(f => 
        this.featureService.constructor.prototype.featureObjectToArray
          ? this.model.featureObjectToArray(f)
          : Object.values(f).filter(v => typeof v === 'number')
      );
      
      // Stage 5: Train/validation split
      this.updateStatus('data_splitting', 50);
      const split = this.trainingDataService.trainTestSplit(
        featureArrays,
        dataset.labels,
        config.validationSplit
      );
      
      console.log('[Pipeline] Training samples:', split.trainFeatures.length);
      console.log('[Pipeline] Validation samples:', split.valFeatures.length);
      
      // Stage 6: Model training
      this.updateStatus('model_training', 60);
      
      let trainingResult;
      if (config.hyperparameterTuning) {
        // Hyperparameter tuning
        trainingResult = await this.hyperparameterTuning(split, config);
      } else {
        // Standard training
        trainingResult = await this.model.train(
          split.trainFeatures,
          split.trainLabels,
          {
            epochs: config.epochs,
            batchSize: config.batchSize,
            validationSplit: 0, // Already split
            earlyStoppingPatience: config.earlyStoppingPatience,
            verbose: 1
          }
        );
      }
      
      // Stage 7: Model evaluation
      this.updateStatus('model_evaluation', 85);
      const evaluation = await this.model.evaluate(
        split.valFeatures,
        split.valLabels
      );
      
      console.log('[Pipeline] Validation performance:', evaluation);
      
      // Stage 8: Feature importance analysis
      this.updateStatus('feature_importance', 90);
      const featureImportance = await this.analyzeFeatureImportance(
        split.valFeatures,
        split.valLabels
      );
      
      // Stage 9: Model persistence
      this.updateStatus('model_saving', 95);
      await this.model.saveModel();
      
      // Stage 10: Generate report
      this.updateStatus('report_generation', 100);
      const report = this.generateTrainingReport({
        config,
        dataStats,
        validation,
        cleaned,
        dataset,
        split,
        training: trainingResult,
        evaluation,
        featureImportance,
        duration: (Date.now() - startTime) / 1000
      });
      
      console.log('[Pipeline] Training pipeline complete');
      console.log('[Pipeline] Duration:', report.duration, 'seconds');
      console.log('[Pipeline] Final accuracy:', (evaluation.accuracy * 100).toFixed(2) + '%');
      
      this.trainingStatus = {
        isRunning: false,
        currentStage: 'complete',
        progress: 100,
        error: null
      };
      
      return report;
      
    } catch (error) {
      console.error('[Pipeline] Training pipeline failed:', error);
      
      this.trainingStatus = {
        isRunning: false,
        currentStage: 'error',
        progress: 0,
        error: error.message
      };
      
      throw error;
    }
  }

  /**
   * Hyperparameter tuning using grid search
   * @param {Object} split - Train/val split
   * @param {Object} baseConfig - Base configuration
   * @returns {Promise<Object>} Best training result
   */
  async hyperparameterTuning(split, baseConfig) {
    console.log('[Pipeline] Starting hyperparameter tuning');
    
    // Define hyperparameter grid
    const hyperparameters = {
      learningRate: [0.0001, 0.001, 0.01],
      batchSize: [16, 32, 64],
      dropout: [0.2, 0.3, 0.4]
    };
    
    let bestResult = null;
    let bestAccuracy = 0;
    let trialCount = 0;
    
    // Grid search
    for (const lr of hyperparameters.learningRate) {
      for (const bs of hyperparameters.batchSize) {
        for (const dropout of hyperparameters.dropout) {
          trialCount++;
          console.log(`[Pipeline] Trial ${trialCount}: lr=${lr}, bs=${bs}, dropout=${dropout}`);
          
          // Build model with current hyperparameters
          const trialModel = new ApplicationSuccessModel();
          trialModel.buildModel();
          
          // Update learning rate
          trialModel.model.compile({
            optimizer: tf.train.adam(lr),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
          });
          
          // Train
          const result = await trialModel.train(
            split.trainFeatures,
            split.trainLabels,
            {
              epochs: Math.floor(baseConfig.epochs / 2), // Shorter for tuning
              batchSize: bs,
              validationSplit: 0,
              earlyStoppingPatience: 5,
              verbose: 0
            }
          );
          
          // Evaluate
          const evaluation = await trialModel.evaluate(
            split.valFeatures,
            split.valLabels
          );
          
          console.log(`[Pipeline] Trial ${trialCount} accuracy: ${(evaluation.accuracy * 100).toFixed(2)}%`);
          
          // Keep best model
          if (evaluation.accuracy > bestAccuracy) {
            bestAccuracy = evaluation.accuracy;
            bestResult = result;
            
            // Update main model
            this.model = trialModel;
            
            console.log(`[Pipeline] New best accuracy: ${(bestAccuracy * 100).toFixed(2)}%`);
          }
        }
      }
    }
    
    console.log('[Pipeline] Hyperparameter tuning complete');
    console.log('[Pipeline] Best accuracy:', (bestAccuracy * 100).toFixed(2) + '%');
    
    return bestResult;
  }

  /**
   * Analyze feature importance using permutation importance
   * @param {Array} features - Validation features
   * @param {Array} labels - Validation labels
   * @returns {Promise<Array>} Feature importance scores
   */
  async analyzeFeatureImportance(features, labels) {
    console.log('[Pipeline] Analyzing feature importance');
    
    // Baseline accuracy
    const baselineEval = await this.model.evaluate(features, labels);
    const baselineAccuracy = baselineEval.accuracy;
    
    const featureNames = Object.keys(this.featureService.getFeatureNames());
    const importance = [];
    
    // Permutation importance (simplified - sample only top features)
    const topFeatures = featureNames.slice(0, 10); // Top 10 features
    
    for (let i = 0; i < topFeatures.length; i++) {
      // Create permuted features
      const permuted = features.map(f => [...f]);
      
      // Shuffle feature i
      const values = permuted.map(f => f[i]);
      this.shuffle(values);
      permuted.forEach((f, j) => f[i] = values[j]);
      
      // Evaluate with permuted feature
      const permutedEval = await this.model.evaluate(permuted, labels);
      const permutedAccuracy = permutedEval.accuracy;
      
      // Importance = drop in accuracy
      const importanceScore = baselineAccuracy - permutedAccuracy;
      
      importance.push({
        feature: featureNames[i],
        importance: importanceScore,
        rank: 0 // Will be set after sorting
      });
    }
    
    // Sort by importance
    importance.sort((a, b) => b.importance - a.importance);
    importance.forEach((item, i) => item.rank = i + 1);
    
    console.log('[Pipeline] Top 5 most important features:');
    importance.slice(0, 5).forEach(item => {
      console.log(`  ${item.rank}. ${item.feature}: ${item.importance.toFixed(4)}`);
    });
    
    return importance;
  }

  /**
   * Generate comprehensive training report
   * @param {Object} results - All training results
   * @returns {Object} Training report
   */
  generateTrainingReport(results) {
    const report = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      duration: results.duration,
      
      // Configuration
      configuration: results.config,
      
      // Data statistics
      dataStatistics: {
        totalApplications: results.dataStats.totalApplications,
        completedApplications: results.dataStats.completedApplications,
        successRate: results.dataStats.successRate,
        classBalance: results.dataStats.classBalance,
        cleanedSamples: results.cleaned.stats.cleaned,
        removedSamples: results.cleaned.stats.removed
      },
      
      // Data quality
      dataQuality: {
        isValid: results.validation.isValid,
        completeness: results.validation.quality.completeness,
        issueCount: results.validation.totalIssues
      },
      
      // Training
      training: {
        trainingSamples: results.split.trainFeatures.length,
        validationSamples: results.split.valFeatures.length,
        epochs: results.training.metadata.epochs,
        finalLoss: results.training.history.loss[results.training.history.loss.length - 1],
        finalAccuracy: results.training.history.acc[results.training.history.acc.length - 1],
        finalValLoss: results.training.history.val_loss[results.training.history.val_loss.length - 1],
        finalValAccuracy: results.training.history.val_acc[results.training.history.val_acc.length - 1]
      },
      
      // Evaluation
      evaluation: {
        accuracy: results.evaluation.accuracy,
        precision: results.evaluation.precision,
        recall: results.evaluation.recall,
        f1Score: results.evaluation.f1Score,
        auc: results.evaluation.auc,
        confusionMatrix: results.evaluation.confusionMatrix
      },
      
      // Feature importance
      featureImportance: results.featureImportance.slice(0, 10), // Top 10
      
      // Model metadata
      model: {
        architecture: this.model.getModelInfo().architecture,
        trainedAt: this.model.metadata.trainedAt
      },
      
      // Recommendations
      recommendations: this.generateRecommendations(results)
    };
    
    return report;
  }

  /**
   * Generate recommendations based on training results
   * @param {Object} results - Training results
   * @returns {Array} Recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];
    
    // Check data size
    if (results.dataStats.completedApplications < 100) {
      recommendations.push({
        type: 'data',
        priority: 'high',
        message: `Collect more training data (current: ${results.dataStats.completedApplications}, target: 100+) for better model performance`
      });
    }
    
    // Check class balance
    if (results.dataStats.classBalance) {
      const balance = Math.min(
        results.dataStats.classBalance.success,
        results.dataStats.classBalance.failure
      );
      
      if (balance < 0.3) {
        recommendations.push({
          type: 'data',
          priority: 'medium',
          message: 'Class imbalance detected. Consider collecting more samples for the minority class.'
        });
      }
    }
    
    // Check accuracy
    if (results.evaluation.accuracy < 0.7) {
      recommendations.push({
        type: 'model',
        priority: 'high',
        message: `Model accuracy is low (${(results.evaluation.accuracy * 100).toFixed(1)}%). Consider:\n` +
          '  - Collecting more training data\n' +
          '  - Feature engineering improvements\n' +
          '  - Hyperparameter tuning'
      });
    }
    
    // Check F1 score
    if (results.evaluation.f1Score < 0.65) {
      recommendations.push({
        type: 'model',
        priority: 'medium',
        message: 'F1 score is moderate. Model may benefit from class weight adjustment or threshold tuning.'
      });
    }
    
    // Check data quality
    if (results.validation.quality.completeness < 0.9) {
      recommendations.push({
        type: 'data',
        priority: 'medium',
        message: `Data completeness is ${(results.validation.quality.completeness * 100).toFixed(1)}%. Review and fix data quality issues.`
      });
    }
    
    // Check overfitting
    const trainAcc = results.training.finalAccuracy;
    const valAcc = results.training.finalValAccuracy;
    
    if (trainAcc - valAcc > 0.15) {
      recommendations.push({
        type: 'model',
        priority: 'high',
        message: 'Potential overfitting detected (train-val gap > 15%). Consider:\n' +
          '  - Increasing dropout rates\n' +
          '  - Adding more training data\n' +
          '  - Reducing model complexity'
      });
    }
    
    // Success
    if (results.evaluation.accuracy >= 0.7 && results.evaluation.f1Score >= 0.65) {
      recommendations.push({
        type: 'success',
        priority: 'info',
        message: 'Model performance is good! Ready for production use.'
      });
    }
    
    return recommendations;
  }

  /**
   * Update training status
   * @param {string} stage - Current stage
   * @param {number} progress - Progress percentage (0-100)
   */
  updateStatus(stage, progress) {
    this.trainingStatus.currentStage = stage;
    this.trainingStatus.progress = progress;
    
    // Emit event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trainingProgress', {
        detail: this.trainingStatus
      }));
    }
  }

  /**
   * Get current training status
   * @returns {Object} Training status
   */
  getStatus() {
    return { ...this.trainingStatus };
  }

  /**
   * Shuffle array in place
   * @param {Array} array - Array to shuffle
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Export training report to JSON
   * @param {Object} report - Training report
   * @returns {string} JSON string
   */
  exportReport(report) {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Validate model performance meets minimum requirements
   * @param {Object} evaluation - Evaluation metrics
   * @returns {Object} Validation result
   */
  validateModelPerformance(evaluation) {
    const requirements = {
      minAccuracy: 0.65,
      minPrecision: 0.60,
      minRecall: 0.60,
      minF1: 0.60,
      minAUC: 0.70
    };
    
    const checks = {
      accuracy: evaluation.accuracy >= requirements.minAccuracy,
      precision: evaluation.precision >= requirements.minPrecision,
      recall: evaluation.recall >= requirements.minRecall,
      f1Score: evaluation.f1Score >= requirements.minF1,
      auc: evaluation.auc >= requirements.minAUC
    };
    
    const passed = Object.values(checks).every(check => check);
    
    return {
      passed,
      checks,
      requirements,
      evaluation,
      message: passed
        ? 'Model meets minimum performance requirements'
        : 'Model does not meet minimum requirements. More training data or tuning needed.'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModelTrainingPipeline;
}
