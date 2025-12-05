/**
 * Training Data Service for Application Success Prediction
 * 
 * Collects and structures training data from user applications:
 * - Job requirements and postings
 * - User's resume at time of application
 * - Application outcomes (interview/reject/offer)
 * - Application metadata (timing, source, etc.)
 * 
 * Stores data locally and provides methods for:
 * - Data collection
 * - Data export/import
 * - Train/test splitting
 * - Data quality validation
 */

class TrainingDataService {
  constructor() {
    this.storageKey = 'ml_training_data';
    this.outcomeKey = 'ml_application_outcomes';
    this.minSamplesForTraining = 30; // Minimum samples needed for training
  }

  /**
   * Record a new application for training data
   * @param {Object} application - Application data
   * @returns {Promise<string>} Application ID
   */
  async recordApplication(application) {
    const applicationId = this.generateApplicationId();
    
    const record = {
      id: applicationId,
      timestamp: new Date().toISOString(),
      
      // Job data (snapshot at time of application)
      jobPosting: {
        title: application.jobTitle,
        description: application.jobDescription,
        company: application.companyName,
        companySize: application.companySize,
        location: application.location,
        remote: application.remote,
        salary: application.salary,
        postedDate: application.postedDate,
        source: application.source // LinkedIn, Indeed, etc.
      },
      
      // User data (snapshot of resume at time of application)
      resume: {
        summary: application.resumeData.summary,
        experience: application.resumeData.experience,
        education: application.resumeData.education,
        skills: application.resumeData.skills,
        location: application.resumeData.location,
        targetTitles: application.resumeData.targetTitles,
        preferences: application.resumeData.preferences
      },
      
      // Application context
      applicationContext: {
        applicationDate: new Date().toISOString(),
        source: application.applicationSource, // Extension, manual, etc.
        customCoverLetter: application.hasCustomCoverLetter,
        customResume: application.hasCustomResume,
        referral: application.hasReferral,
        daysSincePosted: application.daysSincePosted
      },
      
      // Outcome (to be filled later)
      outcome: {
        status: 'pending', // pending, interview, reject, offer, withdrawn
        updatedAt: null,
        interviewDate: null,
        rejectionDate: null,
        offerDate: null,
        feedback: null,
        notes: null
      },
      
      // Metadata
      version: '1.0',
      extensionVersion: chrome.runtime.getManifest().version
    };
    
    await this.saveApplicationRecord(record);
    
    console.log(`[TrainingData] Recorded application ${applicationId}`);
    return applicationId;
  }

  /**
   * Update application outcome
   * @param {string} applicationId - Application ID
   * @param {Object} outcome - Outcome data
   * @returns {Promise<boolean>} Success status
   */
  async updateApplicationOutcome(applicationId, outcome) {
    const records = await this.getAllRecords();
    const record = records.find(r => r.id === applicationId);
    
    if (!record) {
      console.error(`[TrainingData] Application ${applicationId} not found`);
      return false;
    }
    
    // Update outcome
    record.outcome = {
      ...record.outcome,
      status: outcome.status, // interview, reject, offer
      updatedAt: new Date().toISOString(),
      interviewDate: outcome.interviewDate,
      rejectionDate: outcome.rejectionDate,
      offerDate: outcome.offerDate,
      feedback: outcome.feedback,
      notes: outcome.notes
    };
    
    await this.updateApplicationRecord(record);
    
    console.log(`[TrainingData] Updated outcome for ${applicationId}: ${outcome.status}`);
    return true;
  }

  /**
   * Get all application records
   * @returns {Promise<Array>} Array of application records
   */
  async getAllRecords() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        resolve(result[this.storageKey] || []);
      });
    });
  }

  /**
   * Get records with outcomes (completed applications)
   * @returns {Promise<Array>} Array of records with outcomes
   */
  async getRecordsWithOutcomes() {
    const records = await this.getAllRecords();
    return records.filter(r => 
      r.outcome.status !== 'pending' && 
      r.outcome.status !== 'withdrawn'
    );
  }

  /**
   * Get training dataset (features + labels)
   * @returns {Promise<Object>} {features, labels, ids}
   */
  async getTrainingDataset() {
    const records = await this.getRecordsWithOutcomes();
    
    if (records.length < this.minSamplesForTraining) {
      throw new Error(
        `Insufficient training data: ${records.length} samples (minimum: ${this.minSamplesForTraining})`
      );
    }
    
    const FeatureEngineeringService = require('./FeatureEngineeringService');
    const featureService = new FeatureEngineeringService();
    
    const features = [];
    const labels = [];
    const ids = [];
    
    for (const record of records) {
      try {
        // Extract features
        const featureVector = featureService.extractFeatures(
          record.jobPosting,
          record.resume,
          record.applicationContext
        );
        
        // Create label (1 = success, 0 = failure)
        // Success = interview or offer
        const label = this.outcomeToLabel(record.outcome.status);
        
        features.push(featureVector);
        labels.push(label);
        ids.push(record.id);
      } catch (error) {
        console.warn(`[TrainingData] Failed to process record ${record.id}:`, error);
      }
    }
    
    console.log(`[TrainingData] Prepared ${features.length} training samples`);
    
    return {
      features,
      labels,
      ids,
      metadata: {
        totalRecords: records.length,
        successRate: labels.filter(l => l === 1).length / labels.length,
        recordCount: {
          interview: records.filter(r => r.outcome.status === 'interview').length,
          reject: records.filter(r => r.outcome.status === 'reject').length,
          offer: records.filter(r => r.outcome.status === 'offer').length
        }
      }
    };
  }

  /**
   * Split data into train/validation sets
   * @param {Array} features - Feature vectors
   * @param {Array} labels - Labels
   * @param {number} validationSplit - Validation split ratio (default 0.2)
   * @returns {Object} {trainFeatures, trainLabels, valFeatures, valLabels}
   */
  trainTestSplit(features, labels, validationSplit = 0.2) {
    // Shuffle data
    const indices = Array.from({length: features.length}, (_, i) => i);
    this.shuffleArray(indices);
    
    const splitIndex = Math.floor(features.length * (1 - validationSplit));
    
    const trainIndices = indices.slice(0, splitIndex);
    const valIndices = indices.slice(splitIndex);
    
    return {
      trainFeatures: trainIndices.map(i => features[i]),
      trainLabels: trainIndices.map(i => labels[i]),
      valFeatures: valIndices.map(i => features[i]),
      valLabels: valIndices.map(i => labels[i]),
      trainIndices,
      valIndices
    };
  }

  /**
   * Export training data to JSON file
   * @returns {Promise<string>} JSON string of training data
   */
  async exportTrainingData() {
    const records = await this.getAllRecords();
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      records: records
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import training data from JSON
   * @param {string} jsonData - JSON string of training data
   * @returns {Promise<number>} Number of records imported
   */
  async importTrainingData(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.records || !Array.isArray(importData.records)) {
        throw new Error('Invalid import format');
      }
      
      const existingRecords = await this.getAllRecords();
      const existingIds = new Set(existingRecords.map(r => r.id));
      
      // Only import new records (avoid duplicates)
      const newRecords = importData.records.filter(r => !existingIds.has(r.id));
      
      if (newRecords.length === 0) {
        console.log('[TrainingData] No new records to import');
        return 0;
      }
      
      const allRecords = [...existingRecords, ...newRecords];
      
      await new Promise((resolve) => {
        chrome.storage.local.set({[this.storageKey]: allRecords}, resolve);
      });
      
      console.log(`[TrainingData] Imported ${newRecords.length} new records`);
      return newRecords.length;
    } catch (error) {
      console.error('[TrainingData] Import failed:', error);
      throw error;
    }
  }

  /**
   * Get dataset statistics
   * @returns {Promise<Object>} Dataset statistics
   */
  async getDatasetStatistics() {
    const allRecords = await this.getAllRecords();
    const withOutcomes = await this.getRecordsWithOutcomes();
    
    const outcomeCount = {
      pending: 0,
      interview: 0,
      reject: 0,
      offer: 0,
      withdrawn: 0
    };
    
    for (const record of allRecords) {
      outcomeCount[record.outcome.status] = (outcomeCount[record.outcome.status] || 0) + 1;
    }
    
    const successCount = outcomeCount.interview + outcomeCount.offer;
    const failureCount = outcomeCount.reject;
    const totalCompleted = successCount + failureCount;
    
    return {
      totalApplications: allRecords.length,
      completedApplications: withOutcomes.length,
      pendingApplications: outcomeCount.pending,
      withdrawnApplications: outcomeCount.withdrawn,
      
      outcomes: outcomeCount,
      
      successRate: totalCompleted > 0 ? successCount / totalCompleted : 0,
      interviewRate: allRecords.length > 0 ? outcomeCount.interview / allRecords.length : 0,
      offerRate: allRecords.length > 0 ? outcomeCount.offer / allRecords.length : 0,
      rejectionRate: allRecords.length > 0 ? outcomeCount.reject / allRecords.length : 0,
      
      readyForTraining: withOutcomes.length >= this.minSamplesForTraining,
      samplesNeeded: Math.max(0, this.minSamplesForTraining - withOutcomes.length),
      
      classBalance: totalCompleted > 0 ? {
        success: successCount / totalCompleted,
        failure: failureCount / totalCompleted
      } : null
    };
  }

  /**
   * Validate data quality
   * @returns {Promise<Object>} Validation results
   */
  async validateDataQuality() {
    const records = await this.getRecordsWithOutcomes();
    
    const issues = {
      missingJobTitle: [],
      missingJobDescription: [],
      missingResume: [],
      missingSkills: [],
      incompleteOutcome: [],
      duplicates: []
    };
    
    const seenJobs = new Map(); // Track potential duplicates
    
    for (const record of records) {
      // Check for missing critical fields
      if (!record.jobPosting.title) {
        issues.missingJobTitle.push(record.id);
      }
      
      if (!record.jobPosting.description || record.jobPosting.description.length < 50) {
        issues.missingJobDescription.push(record.id);
      }
      
      if (!record.resume || !record.resume.experience || record.resume.experience.length === 0) {
        issues.missingResume.push(record.id);
      }
      
      if (!record.resume.skills || record.resume.skills.length === 0) {
        issues.missingSkills.push(record.id);
      }
      
      if (!record.outcome.updatedAt) {
        issues.incompleteOutcome.push(record.id);
      }
      
      // Check for duplicates (same job title + company + application date)
      const jobKey = `${record.jobPosting.title}_${record.jobPosting.company}_${record.timestamp.split('T')[0]}`;
      if (seenJobs.has(jobKey)) {
        issues.duplicates.push({
          id: record.id,
          duplicateOf: seenJobs.get(jobKey)
        });
      } else {
        seenJobs.set(jobKey, record.id);
      }
    }
    
    const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
    
    return {
      isValid: totalIssues === 0,
      totalRecords: records.length,
      totalIssues,
      issues,
      quality: {
        completeness: 1 - (totalIssues / (records.length * 6)), // 6 checks per record
        recommendation: totalIssues === 0 
          ? 'Data quality is good, ready for training'
          : 'Data quality issues detected, review and clean data before training'
      }
    };
  }

  /**
   * Clean and prepare data for training
   * @returns {Promise<Object>} Cleaned dataset
   */
  async cleanDataForTraining() {
    const records = await this.getRecordsWithOutcomes();
    
    // Filter out records with critical missing data
    const cleanRecords = records.filter(record => {
      return (
        record.jobPosting.title &&
        record.jobPosting.description &&
        record.jobPosting.description.length >= 50 &&
        record.resume &&
        record.resume.experience &&
        record.resume.experience.length > 0 &&
        record.resume.skills &&
        record.resume.skills.length > 0 &&
        record.outcome.updatedAt
      );
    });
    
    // Remove duplicates (keep first occurrence)
    const seen = new Set();
    const deduplicatedRecords = cleanRecords.filter(record => {
      const key = `${record.jobPosting.title}_${record.jobPosting.company}_${record.timestamp.split('T')[0]}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    console.log(`[TrainingData] Cleaned data: ${records.length} → ${deduplicatedRecords.length} records`);
    
    return {
      records: deduplicatedRecords,
      removedCount: records.length - deduplicatedRecords.length,
      stats: {
        total: records.length,
        cleaned: deduplicatedRecords.length,
        removed: records.length - deduplicatedRecords.length
      }
    };
  }

  /**
   * Get sample application for testing
   * @returns {Object} Sample application data
   */
  getSampleApplication() {
    return {
      jobTitle: 'Senior Software Engineer',
      jobDescription: `We are seeking a Senior Software Engineer to join our team.
Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript, React, Node.js
- Experience with cloud platforms (AWS, GCP)
- Bachelor's degree in Computer Science or related field
- Excellent problem-solving skills

Responsibilities:
- Design and implement scalable backend services
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews`,
      companyName: 'TechCorp Inc',
      companySize: 'large',
      location: 'San Francisco, CA',
      remote: false,
      salary: { min: 140000, max: 180000 },
      postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'LinkedIn',
      
      resumeData: {
        summary: 'Experienced software engineer with 6 years in full-stack development',
        experience: [
          {
            title: 'Software Engineer',
            company: 'StartupCo',
            startDate: '2019-01-01',
            endDate: '2023-12-31',
            current: false,
            description: 'Built scalable web applications using React and Node.js'
          }
        ],
        education: [
          {
            degree: 'Bachelor',
            field: 'Computer Science',
            school: 'State University',
            graduationYear: 2018,
            gpa: 3.6
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
        location: 'San Francisco, CA',
        targetTitles: ['Software Engineer', 'Senior Software Engineer'],
        preferences: {
          willingToRelocate: true
        }
      },
      
      applicationSource: 'extension',
      hasCustomCoverLetter: true,
      hasCustomResume: false,
      hasReferral: false,
      daysSincePosted: 3
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Generate unique application ID
   */
  generateApplicationId() {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save application record
   */
  async saveApplicationRecord(record) {
    const records = await this.getAllRecords();
    records.push(record);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({[this.storageKey]: records}, resolve);
    });
  }

  /**
   * Update application record
   */
  async updateApplicationRecord(updatedRecord) {
    const records = await this.getAllRecords();
    const index = records.findIndex(r => r.id === updatedRecord.id);
    
    if (index !== -1) {
      records[index] = updatedRecord;
      
      return new Promise((resolve) => {
        chrome.storage.local.set({[this.storageKey]: records}, resolve);
      });
    }
    
    return Promise.reject(new Error('Record not found'));
  }

  /**
   * Convert outcome status to binary label
   */
  outcomeToLabel(status) {
    // Success (1): interview or offer
    // Failure (0): reject
    const successStatuses = ['interview', 'offer'];
    return successStatuses.includes(status) ? 1 : 0;
  }

  /**
   * Shuffle array in place (Fisher-Yates algorithm)
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Delete all training data (for testing)
   */
  async clearAllData() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.storageKey], () => {
        console.log('[TrainingData] All training data cleared');
        resolve();
      });
    });
  }

  /**
   * Get records by date range
   */
  async getRecordsByDateRange(startDate, endDate) {
    const records = await this.getAllRecords();
    
    return records.filter(record => {
      const timestamp = new Date(record.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  /**
   * Get records by outcome status
   */
  async getRecordsByOutcome(status) {
    const records = await this.getAllRecords();
    return records.filter(r => r.outcome.status === status);
  }

  /**
   * Get success rate by feature
   */
  async getSuccessRateByFeature(featureName) {
    const dataset = await this.getTrainingDataset();
    
    // Group by feature value (binned)
    const bins = new Map();
    
    for (let i = 0; i < dataset.features.length; i++) {
      const featureValue = dataset.features[i][featureName];
      const label = dataset.labels[i];
      
      // Bin feature value (0-0.2, 0.2-0.4, etc.)
      const bin = Math.floor(featureValue * 5) / 5;
      
      if (!bins.has(bin)) {
        bins.set(bin, { total: 0, success: 0 });
      }
      
      bins.get(bin).total++;
      if (label === 1) bins.get(bin).success++;
    }
    
    // Calculate success rate per bin
    const results = [];
    for (const [bin, data] of bins) {
      results.push({
        binStart: bin,
        binEnd: bin + 0.2,
        count: data.total,
        successRate: data.success / data.total
      });
    }
    
    return results.sort((a, b) => a.binStart - b.binStart);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrainingDataService;
}
