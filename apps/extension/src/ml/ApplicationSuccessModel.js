/**
 * Application Success Prediction Model
 * 
 * Neural network model for binary classification (success/failure).
 * Uses TensorFlow.js for browser-based machine learning.
 * 
 * Model Architecture:
 * - Input Layer: 35 features (normalized 0-1)
 * - Dense Layer 1: 64 units, ReLU activation
 * - Dropout Layer 1: 0.3 dropout rate
 * - Dense Layer 2: 32 units, ReLU activation
 * - Dropout Layer 2: 0.2 dropout rate
 * - Dense Layer 3: 16 units, ReLU activation
 * - Output Layer: 1 unit, Sigmoid activation (probability 0-1)
 * 
 * Training:
 * - Loss: Binary crossentropy
 * - Optimizer: Adam (learning rate: 0.001)
 * - Metrics: Accuracy, Precision, Recall, AUC
 * - Early stopping: Monitor validation loss
 */

// Import TensorFlow.js (ensure it's loaded in manifest.json)
// <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest"></script>

class ApplicationSuccessModel {
  constructor() {
    this.model = null;
    this.inputFeatures = 35; // Number of features from FeatureEngineeringService
    this.modelPath = 'indexeddb://application-success-model';
    this.isTraining = false;
    this.trainingHistory = null;
    
    // Feature normalization parameters (learned from training data)
    this.featureStats = null; // { mean: [], std: [] }
    
    // Model metadata
    this.metadata = {
      version: '1.0',
      trainedAt: null,
      trainingSize: 0,
      validationSize: 0,
      performance: null
    };
  }

  /**
   * Build model architecture
   * @returns {tf.Sequential} TensorFlow.js model
   */
  buildModel() {
    const model = tf.sequential();
    
    // Input layer + First dense layer
    model.add(tf.layers.dense({
      inputShape: [this.inputFeatures],
      units: 64,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      name: 'dense_1'
    }));
    
    // Dropout for regularization
    model.add(tf.layers.dropout({
      rate: 0.3,
      name: 'dropout_1'
    }));
    
    // Second dense layer
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      name: 'dense_2'
    }));
    
    // Dropout
    model.add(tf.layers.dropout({
      rate: 0.2,
      name: 'dropout_2'
    }));
    
    // Third dense layer
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
      kernelInitializer: 'heNormal',
      name: 'dense_3'
    }));
    
    // Output layer (binary classification)
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      name: 'output'
    }));
    
    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    });
    
    console.log('[Model] Built neural network');
    model.summary();
    
    this.model = model;
    return model;
  }

  /**
   * Train model on dataset
   * @param {Array} features - Training features (2D array)
   * @param {Array} labels - Training labels (1D array, 0 or 1)
   * @param {Object} options - Training options
   * @returns {Promise<Object>} Training history
   */
  async train(features, labels, options = {}) {
    if (this.isTraining) {
      throw new Error('Model is already training');
    }
    
    this.isTraining = true;
    
    try {
      // Default options
      const {
        epochs = 100,
        batchSize = 32,
        validationSplit = 0.2,
        earlyStoppingPatience = 10,
        classWeight = null, // Auto-compute if null
        verbose = 1
      } = options;
      
      console.log(`[Model] Training with ${features.length} samples`);
      console.log(`[Model] Epochs: ${epochs}, Batch size: ${batchSize}`);
      
      // Build model if not already built
      if (!this.model) {
        this.buildModel();
      }
      
      // Compute feature normalization parameters
      this.featureStats = this.computeFeatureStats(features);
      
      // Normalize features
      const normalizedFeatures = this.normalizeFeatures(features);
      
      // Convert to tensors
      const xs = tf.tensor2d(normalizedFeatures);
      const ys = tf.tensor2d(labels.map(l => [l])); // Shape: [n, 1]
      
      // Compute class weights if not provided (handle imbalanced data)
      const computedClassWeight = classWeight || this.computeClassWeights(labels);
      
      console.log('[Model] Class weights:', computedClassWeight);
      
      // Training callbacks
      const callbacks = {
        onEpochEnd: (epoch, logs) => {
          if (verbose) {
            console.log(
              `Epoch ${epoch + 1}: ` +
              `loss=${logs.loss.toFixed(4)}, ` +
              `acc=${logs.acc.toFixed(4)}, ` +
              `val_loss=${logs.val_loss.toFixed(4)}, ` +
              `val_acc=${logs.val_acc.toFixed(4)}`
            );
          }
        },
        
        // Early stopping
        earlyStopping: tf.callbacks.earlyStopping({
          monitor: 'val_loss',
          patience: earlyStoppingPatience,
          restoreBestWeights: true
        })
      };
      
      // Train model
      const history = await this.model.fit(xs, ys, {
        epochs,
        batchSize,
        validationSplit,
        classWeight: computedClassWeight,
        callbacks: [callbacks.earlyStopping],
        shuffle: true,
        verbose: verbose
      });
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
      
      // Store training history
      this.trainingHistory = history.history;
      
      // Update metadata
      this.metadata.trainedAt = new Date().toISOString();
      this.metadata.trainingSize = Math.floor(features.length * (1 - validationSplit));
      this.metadata.validationSize = Math.ceil(features.length * validationSplit);
      this.metadata.epochs = history.epoch.length;
      
      // Save model
      await this.saveModel();
      
      console.log('[Model] Training complete');
      this.isTraining = false;
      
      return {
        history: this.trainingHistory,
        metadata: this.metadata
      };
      
    } catch (error) {
      this.isTraining = false;
      console.error('[Model] Training failed:', error);
      throw error;
    }
  }

  /**
   * Make prediction for a single application
   * @param {Object} features - Feature object from FeatureEngineeringService
   * @returns {Promise<Object>} Prediction result with probability and confidence
   */
  async predict(features) {
    if (!this.model) {
      await this.loadModel();
    }
    
    if (!this.model) {
      throw new Error('Model not loaded. Train or load a model first.');
    }
    
    // Convert feature object to array
    const featureArray = this.featureObjectToArray(features);
    
    // Normalize features
    const normalized = this.normalizeFeatures([featureArray])[0];
    
    // Make prediction
    const input = tf.tensor2d([normalized]);
    const prediction = this.model.predict(input);
    const probability = (await prediction.data())[0];
    
    // Clean up tensors
    input.dispose();
    prediction.dispose();
    
    // Calculate confidence (distance from 0.5)
    const confidence = Math.abs(probability - 0.5) * 2; // 0 to 1
    
    // Determine class
    const predictedClass = probability >= 0.5 ? 1 : 0;
    const predictedLabel = predictedClass === 1 ? 'success' : 'failure';
    
    // Match score (0-100)
    const matchScore = Math.round(probability * 100);
    
    return {
      probability,
      confidence,
      predictedClass,
      predictedLabel,
      matchScore,
      features: featureArray,
      normalizedFeatures: normalized
    };
  }

  /**
   * Evaluate model on test set
   * @param {Array} features - Test features
   * @param {Array} labels - Test labels
   * @returns {Promise<Object>} Evaluation metrics
   */
  async evaluate(features, labels) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    
    // Normalize features
    const normalizedFeatures = this.normalizeFeatures(features);
    
    // Convert to tensors
    const xs = tf.tensor2d(normalizedFeatures);
    const ys = tf.tensor2d(labels.map(l => [l]));
    
    // Evaluate
    const result = this.model.evaluate(xs, ys);
    
    // Extract metrics
    const loss = (await result[0].data())[0];
    const accuracy = (await result[1].data())[0];
    const precision = result[2] ? (await result[2].data())[0] : null;
    const recall = result[3] ? (await result[3].data())[0] : null;
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    result.forEach(r => r.dispose());
    
    // Compute additional metrics
    const predictions = await this.batchPredict(features);
    const metrics = this.computeDetailedMetrics(
      labels,
      predictions.map(p => p.predictedClass),
      predictions.map(p => p.probability)
    );
    
    // Store performance
    this.metadata.performance = {
      loss,
      accuracy,
      precision,
      recall,
      ...metrics
    };
    
    return this.metadata.performance;
  }

  /**
   * Batch prediction for multiple applications
   * @param {Array} featuresArray - Array of feature objects
   * @returns {Promise<Array>} Array of prediction results
   */
  async batchPredict(featuresArray) {
    const predictions = [];
    
    for (const features of featuresArray) {
      const prediction = await this.predict(features);
      predictions.push(prediction);
    }
    
    return predictions;
  }

  /**
   * Save model to IndexedDB
   * @returns {Promise<void>}
   */
  async saveModel() {
    if (!this.model) {
      throw new Error('No model to save');
    }
    
    try {
      // Save model
      await this.model.save(this.modelPath);
      
      // Save metadata and feature stats separately
      const metadataJson = JSON.stringify({
        metadata: this.metadata,
        featureStats: this.featureStats
      });
      
      localStorage.setItem('model_metadata', metadataJson);
      
      console.log('[Model] Saved to IndexedDB');
    } catch (error) {
      console.error('[Model] Save failed:', error);
      throw error;
    }
  }

  /**
   * Load model from IndexedDB
   * @returns {Promise<boolean>} Success status
   */
  async loadModel() {
    try {
      // Load model
      this.model = await tf.loadLayersModel(this.modelPath);
      
      // Load metadata
      const metadataJson = localStorage.getItem('model_metadata');
      if (metadataJson) {
        const data = JSON.parse(metadataJson);
        this.metadata = data.metadata;
        this.featureStats = data.featureStats;
      }
      
      console.log('[Model] Loaded from IndexedDB');
      console.log('[Model] Trained at:', this.metadata.trainedAt);
      
      return true;
    } catch (error) {
      console.warn('[Model] Load failed:', error.message);
      return false;
    }
  }

  /**
   * Check if model exists and is trained
   * @returns {Promise<boolean>} True if model exists
   */
  async modelExists() {
    try {
      const modelInfo = await tf.io.listModels();
      return this.modelPath in modelInfo;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete saved model
   * @returns {Promise<void>}
   */
  async deleteModel() {
    try {
      await tf.io.removeModel(this.modelPath);
      localStorage.removeItem('model_metadata');
      this.model = null;
      this.metadata.trainedAt = null;
      console.log('[Model] Deleted');
    } catch (error) {
      console.error('[Model] Delete failed:', error);
    }
  }

  /**
   * Get model summary
   * @returns {Object} Model information
   */
  getModelInfo() {
    return {
      architecture: {
        inputFeatures: this.inputFeatures,
        layers: [
          { type: 'dense', units: 64, activation: 'relu' },
          { type: 'dropout', rate: 0.3 },
          { type: 'dense', units: 32, activation: 'relu' },
          { type: 'dropout', rate: 0.2 },
          { type: 'dense', units: 16, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' }
        ]
      },
      metadata: this.metadata,
      trainingHistory: this.trainingHistory,
      isTrained: this.metadata.trainedAt !== null
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Compute feature statistics for normalization
   */
  computeFeatureStats(features) {
    const n = features.length;
    const d = features[0].length;
    
    const mean = new Array(d).fill(0);
    const std = new Array(d).fill(0);
    
    // Compute mean
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        mean[j] += features[i][j];
      }
    }
    for (let j = 0; j < d; j++) {
      mean[j] /= n;
    }
    
    // Compute standard deviation
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < d; j++) {
        std[j] += Math.pow(features[i][j] - mean[j], 2);
      }
    }
    for (let j = 0; j < d; j++) {
      std[j] = Math.sqrt(std[j] / n);
      // Avoid division by zero
      if (std[j] === 0) std[j] = 1;
    }
    
    return { mean, std };
  }

  /**
   * Normalize features using z-score normalization
   */
  normalizeFeatures(features) {
    if (!this.featureStats) {
      throw new Error('Feature stats not computed. Train model first.');
    }
    
    const { mean, std } = this.featureStats;
    
    return features.map(featureVector => 
      featureVector.map((value, j) => (value - mean[j]) / std[j])
    );
  }

  /**
   * Convert feature object to array
   */
  featureObjectToArray(featureObj) {
    // Extract numerical features in consistent order
    const featureNames = [
      'skill_match_score',
      'required_skills_coverage',
      'preferred_skills_coverage',
      'unique_skills_count',
      'skill_depth_score',
      'experience_match_score',
      'years_of_experience',
      'experience_gap',
      'seniority_match',
      'industry_match',
      'company_size_match',
      'education_match',
      'education_level_score',
      'field_match',
      'gpa_score',
      'institution_bonus',
      'location_match',
      'is_remote',
      'relocation_willingness',
      'days_since_posted',
      'application_speed_score',
      'is_early_applicant',
      'time_of_day_score',
      'day_of_week_score',
      'title_similarity',
      'description_similarity',
      'keyword_density',
      'resume_relevance_score',
      'buzzword_match',
      'job_popularity',
      'company_size',
      'is_fortune_500',
      'job_level',
      'salary_competitiveness'
    ];
    
    // Handle missing required_years (use 0 if null)
    const normalized = { ...featureObj };
    if (normalized.required_years === null) {
      normalized.required_years = 0;
    }
    
    return featureNames.map(name => {
      const value = normalized[name];
      return typeof value === 'number' ? value : 0;
    });
  }

  /**
   * Compute class weights for imbalanced data
   */
  computeClassWeights(labels) {
    const counts = { 0: 0, 1: 0 };
    labels.forEach(label => counts[label]++);
    
    const total = labels.length;
    const weight0 = total / (2 * counts[0]);
    const weight1 = total / (2 * counts[1]);
    
    return { 0: weight0, 1: weight1 };
  }

  /**
   * Compute detailed metrics (confusion matrix, F1, AUC)
   */
  computeDetailedMetrics(trueLabels, predLabels, probabilities) {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    
    for (let i = 0; i < trueLabels.length; i++) {
      if (trueLabels[i] === 1 && predLabels[i] === 1) tp++;
      else if (trueLabels[i] === 0 && predLabels[i] === 1) fp++;
      else if (trueLabels[i] === 0 && predLabels[i] === 0) tn++;
      else if (trueLabels[i] === 1 && predLabels[i] === 0) fn++;
    }
    
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1Score = precision + recall > 0 
      ? 2 * (precision * recall) / (precision + recall)
      : 0;
    
    const accuracy = (tp + tn) / trueLabels.length;
    
    // Compute AUC-ROC
    const auc = this.computeAUC(trueLabels, probabilities);
    
    return {
      confusionMatrix: { tp, fp, tn, fn },
      precision,
      recall,
      f1Score,
      accuracy,
      auc,
      totalSamples: trueLabels.length
    };
  }

  /**
   * Compute AUC-ROC score
   */
  computeAUC(trueLabels, probabilities) {
    // Sort by probability descending
    const sorted = trueLabels
      .map((label, i) => ({ label, prob: probabilities[i] }))
      .sort((a, b) => b.prob - a.prob);
    
    let auc = 0;
    let posCount = 0;
    let negCount = 0;
    
    for (const item of sorted) {
      if (item.label === 1) {
        posCount++;
        auc += negCount;
      } else {
        negCount++;
      }
    }
    
    return posCount * negCount > 0 ? auc / (posCount * negCount) : 0.5;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApplicationSuccessModel;
}
