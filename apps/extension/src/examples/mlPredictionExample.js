/**
 * Application Success Prediction - Complete Integration Example
 * 
 * This file demonstrates the full workflow from data collection
 * to prediction to actionable feedback.
 */

// Import all services
// In browser environment, these would be loaded via script tags
// For development, include in your HTML:
// <script src="src/services/FeatureEngineeringService.js"></script>
// <script src="src/services/TrainingDataService.js"></script>
// <script src="src/ml/ApplicationSuccessModel.js"></script>
// <script src="src/ml/ModelTrainingPipeline.js"></script>
// <script src="src/services/ApplicationPredictionService.js"></script>
// <script src="src/services/FeedbackGeneratorService.js"></script>

// ============================================================================
// EXAMPLE 1: Data Collection (User applies to jobs)
// ============================================================================

async function recordUserApplication(applicationData) {
  const trainingData = new TrainingDataService();
  
  // Record application when user submits
  const applicationId = await trainingData.recordApplication({
    // Job information
    jobTitle: applicationData.jobTitle,
    jobDescription: applicationData.jobDescription,
    companyName: applicationData.companyName,
    companySize: applicationData.companySize, // 'startup', 'small', 'medium', 'large', 'enterprise'
    location: applicationData.location,
    remote: applicationData.remote,
    salary: applicationData.salary,
    postedDate: applicationData.postedDate,
    source: applicationData.source, // 'LinkedIn', 'Indeed', etc.
    
    // User's resume data (snapshot at time of application)
    resumeData: {
      summary: applicationData.resume.summary,
      experience: applicationData.resume.experience,
      education: applicationData.resume.education,
      skills: applicationData.resume.skills,
      location: applicationData.resume.location,
      targetTitles: applicationData.resume.targetTitles,
      preferences: applicationData.resume.preferences
    },
    
    // Application context
    applicationSource: 'extension', // or 'manual'
    hasCustomCoverLetter: applicationData.hasCustomCoverLetter,
    hasCustomResume: applicationData.hasCustomResume,
    hasReferral: applicationData.hasReferral,
    daysSincePosted: Math.floor(
      (new Date() - new Date(applicationData.postedDate)) / (1000 * 60 * 60 * 24)
    )
  });
  
  console.log(`[Example] Recorded application: ${applicationId}`);
  
  // Store for later outcome update
  chrome.storage.local.set({
    [`pending_${applicationId}`]: {
      jobTitle: applicationData.jobTitle,
      company: applicationData.companyName,
      appliedDate: new Date().toISOString()
    }
  });
  
  return applicationId;
}

// Example: User applies to job
const exampleApplication = {
  jobTitle: 'Senior Software Engineer',
  jobDescription: `We are seeking a Senior Software Engineer with 5+ years of experience in full-stack development.
  
Required Skills:
- JavaScript, React, Node.js
- 5+ years professional experience
- Bachelor's degree in Computer Science or related field
- Experience with cloud platforms (AWS, GCP)
- Strong problem-solving skills

Responsibilities:
- Design and implement scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews`,
  companyName: 'TechCorp Inc',
  companySize: 'large',
  location: 'San Francisco, CA',
  remote: false,
  salary: { min: 140000, max: 180000 },
  postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  source: 'LinkedIn',
  
  resume: {
    summary: 'Experienced software engineer with 6 years in full-stack development, specializing in React and Node.js.',
    experience: [
      {
        title: 'Software Engineer',
        company: 'StartupCo',
        companySize: 'startup',
        startDate: '2019-01-01',
        endDate: '2023-12-31',
        current: false,
        description: 'Built scalable web applications using React, Node.js, and AWS. Led team of 3 engineers.'
      },
      {
        title: 'Junior Developer',
        company: 'AgencyCo',
        companySize: 'small',
        startDate: '2017-06-01',
        endDate: '2018-12-31',
        current: false,
        description: 'Developed client websites using JavaScript and Python.'
      }
    ],
    education: [
      {
        degree: 'Bachelor',
        field: 'Computer Science',
        school: 'State University',
        graduationYear: 2017,
        gpa: 3.6
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'Git'],
    location: 'San Francisco, CA',
    targetTitles: ['Software Engineer', 'Senior Software Engineer', 'Full Stack Engineer'],
    preferences: {
      willingToRelocate: true,
      remotePreference: 'hybrid'
    }
  },
  
  hasCustomCoverLetter: true,
  hasCustomResume: true,
  hasReferral: false
};

// recordUserApplication(exampleApplication);

// ============================================================================
// EXAMPLE 2: Update Application Outcome
// ============================================================================

async function updateOutcome(applicationId, outcomeData) {
  const trainingData = new TrainingDataService();
  
  await trainingData.updateApplicationOutcome(applicationId, {
    status: outcomeData.status, // 'interview', 'reject', 'offer', 'withdrawn'
    interviewDate: outcomeData.interviewDate,
    rejectionDate: outcomeData.rejectionDate,
    offerDate: outcomeData.offerDate,
    feedback: outcomeData.feedback,
    notes: outcomeData.notes
  });
  
  console.log(`[Example] Updated outcome for ${applicationId}: ${outcomeData.status}`);
  
  // Check if ready for training
  const stats = await trainingData.getDatasetStatistics();
  if (stats.readyForTraining && stats.completedApplications >= 30) {
    console.log(`[Example] Ready for model training! (${stats.completedApplications} samples)`);
    return { readyForTraining: true, stats };
  }
  
  return { readyForTraining: false, stats };
}

// Example: User got interview
// await updateOutcome('app_123', {
//   status: 'interview',
//   interviewDate: '2025-10-25',
//   notes: 'Phone screen scheduled'
// });

// ============================================================================
// EXAMPLE 3: Train Model
// ============================================================================

async function trainPredictionModel(options = {}) {
  console.log('[Example] Starting model training...');
  
  const pipeline = new ModelTrainingPipeline();
  
  // Check if ready
  const trainingData = new TrainingDataService();
  const stats = await trainingData.getDatasetStatistics();
  
  console.log(`[Example] Dataset stats:`);
  console.log(`  - Total applications: ${stats.totalApplications}`);
  console.log(`  - Completed: ${stats.completedApplications}`);
  console.log(`  - Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  console.log(`  - Ready: ${stats.readyForTraining}`);
  
  if (!stats.readyForTraining) {
    console.warn(`[Example] Need ${stats.samplesNeeded} more samples`);
    return null;
  }
  
  // Train model
  const report = await pipeline.runPipeline({
    minSamples: 30,
    validationSplit: 0.2,
    epochs: 100,
    batchSize: 32,
    earlyStoppingPatience: 10,
    hyperparameterTuning: options.hyperparameterTuning || false
  });
  
  console.log('[Example] Training complete!');
  console.log(`  - Duration: ${report.duration.toFixed(1)}s`);
  console.log(`  - Accuracy: ${(report.evaluation.accuracy * 100).toFixed(1)}%`);
  console.log(`  - Precision: ${(report.evaluation.precision * 100).toFixed(1)}%`);
  console.log(`  - Recall: ${(report.evaluation.recall * 100).toFixed(1)}%`);
  console.log(`  - F1 Score: ${(report.evaluation.f1Score * 100).toFixed(1)}%`);
  console.log(`  - AUC: ${report.evaluation.auc.toFixed(3)}`);
  
  if (report.recommendations.length > 0) {
    console.log('[Example] Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  - [${rec.priority}] ${rec.message}`);
    });
  }
  
  return report;
}

// Example: Train model
// const report = await trainPredictionModel();

// ============================================================================
// EXAMPLE 4: Make Prediction
// ============================================================================

async function predictJobSuccess(jobPosting, userResume) {
  console.log(`[Example] Predicting success for: ${jobPosting.title} at ${jobPosting.company}`);
  
  const prediction = new ApplicationPredictionService();
  await prediction.initialize();
  
  // Make prediction
  const result = await prediction.predictApplicationSuccess(
    jobPosting,
    userResume,
    { applicationDate: new Date() }
  );
  
  console.log('\n=== PREDICTION RESULT ===');
  console.log(`Match Score: ${result.matchScore}%`);
  console.log(`Probability: ${(result.probability * 100).toFixed(1)}%`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`Prediction: ${result.predictedOutcome.toUpperCase()}`);
  console.log(`Recommendation: ${result.recommendation.level.toUpperCase()}`);
  console.log(`Message: ${result.recommendation.message}`);
  
  // Confidence interval
  console.log('\n=== CONFIDENCE INTERVAL (95%) ===');
  console.log(`Range: ${(result.confidenceInterval.lower * 100).toFixed(1)}% - ${(result.confidenceInterval.upper * 100).toFixed(1)}%`);
  
  // Top strengths
  console.log('\n=== TOP STRENGTHS ===');
  result.featureBreakdown.strengths.slice(0, 3).forEach((strength, i) => {
    console.log(`${i + 1}. ${strength.description}: ${(strength.value * 100).toFixed(1)}%`);
  });
  
  // Top weaknesses
  console.log('\n=== TOP WEAKNESSES ===');
  result.featureBreakdown.weaknesses.slice(0, 3).forEach((weakness, i) => {
    console.log(`${i + 1}. ${weakness.description}: ${(weakness.value * 100).toFixed(1)}%`);
  });
  
  // Comparison to successful applications
  if (result.comparison.available) {
    console.log('\n=== COMPARISON TO SUCCESSFUL APPLICATIONS ===');
    console.log(`Overall match: ${(result.comparison.overallMatch * 100).toFixed(1)}%`);
    if (result.comparison.significantGaps.length > 0) {
      console.log('Significant gaps:');
      result.comparison.significantGaps.forEach(gap => {
        console.log(`  - ${gap.feature}: ${gap.percentDiff}% below average`);
      });
    }
  }
  
  return result;
}

// Example: Predict for new job
const newJob = {
  title: 'Staff Software Engineer',
  description: `We're looking for a Staff Engineer with 8+ years of experience leading technical initiatives.
  
Requirements:
- 8+ years software engineering experience
- Expert in distributed systems
- Experience with Kubernetes, Docker, AWS
- Master's degree preferred
- Strong leadership and mentoring skills`,
  company: 'BigTech Inc',
  companySize: 'enterprise',
  location: 'Seattle, WA',
  remote: true,
  salary: { min: 180000, max: 250000 },
  postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
};

// const prediction = await predictJobSuccess(newJob, exampleApplication.resume);

// ============================================================================
// EXAMPLE 5: Generate Actionable Feedback
// ============================================================================

async function generateActionableFeedback(prediction) {
  console.log('[Example] Generating actionable feedback...');
  
  const feedbackService = new FeedbackGeneratorService();
  const feedback = feedbackService.generateFeedback(prediction);
  
  console.log('\n=== OVERALL ASSESSMENT ===');
  console.log(`Status: ${feedback.assessment.status.toUpperCase()}`);
  console.log(`Score: ${feedback.assessment.score}%`);
  console.log(`Priority: ${feedback.assessment.priority.toUpperCase()}`);
  console.log(`Message: ${feedback.assessment.message}`);
  
  // Quick wins
  console.log('\n=== QUICK WINS (Easy Improvements) ===');
  feedback.quickWins.forEach((win, i) => {
    console.log(`${i + 1}. ${win.action}`);
    console.log(`   Impact: ${win.impact} | Effort: ${win.effort}`);
  });
  
  // Critical skill gaps
  if (feedback.skills.criticalGaps.length > 0) {
    console.log('\n=== CRITICAL SKILL GAPS ===');
    feedback.skills.criticalGaps.forEach((gap, i) => {
      console.log(`${i + 1}. ${gap.skill}`);
      console.log(`   Action: ${gap.action}`);
      console.log(`   Impact: ${gap.impact}`);
      console.log(`   Estimated time: ${gap.estimatedTime}`);
    });
  }
  
  // Resume optimization
  console.log('\n=== RESUME OPTIMIZATION ===');
  const allOptimizations = [
    ...feedback.resumeOptimization.keywords,
    ...feedback.resumeOptimization.structure,
    ...feedback.resumeOptimization.content
  ];
  allOptimizations.slice(0, 5).forEach((opt, i) => {
    console.log(`${i + 1}. [${opt.priority.toUpperCase()}] ${opt.issue}`);
    console.log(`   Action: ${opt.action}`);
    console.log(`   Impact: ${opt.impact}`);
  });
  
  // Impact estimates
  console.log('\n=== POTENTIAL IMPROVEMENTS ===');
  console.log(`Current Score: ${feedback.impactEstimates.current}%`);
  console.log(`Max Achievable: ${feedback.impactEstimates.maxAchievableScore}%`);
  console.log(`Realistic Target: ${feedback.impactEstimates.realisticScore}%`);
  console.log(`Potential Gain: +${feedback.impactEstimates.totalPotentialImpact} points`);
  
  // Top improvements
  feedback.impactEstimates.improvements.forEach((imp, i) => {
    console.log(`${i + 1}. ${imp.category}: ${imp.description}`);
    console.log(`   Impact: +${imp.impact} points → ${imp.newTotalScore}%`);
  });
  
  // Timeline
  console.log('\n=== IMPROVEMENT TIMELINE ===');
  console.log('Immediate:');
  feedback.timeline.immediate.slice(0, 3).forEach(action => {
    console.log(`  • ${action.action} (${action.effort})`);
  });
  
  console.log('\nShort-term (1-4 weeks):');
  feedback.timeline.shortTerm.actions.forEach(action => {
    console.log(`  • ${action}`);
  });
  
  console.log('\nMedium-term (1-3 months):');
  feedback.timeline.mediumTerm.actions.forEach(action => {
    console.log(`  • ${action}`);
  });
  
  if (feedback.longTermGoals.length > 0) {
    console.log('\nLong-term (3-12 months):');
    feedback.longTermGoals.forEach(goal => {
      console.log(`  • ${goal.goal} (${goal.timeline})`);
    });
  }
  
  return feedback;
}

// Example: Generate feedback
// const feedback = await generateActionableFeedback(prediction);

// ============================================================================
// EXAMPLE 6: Batch Prediction (Find Best Matches)
// ============================================================================

async function findBestMatches(jobList, userResume, topN = 5) {
  console.log(`[Example] Finding best matches from ${jobList.length} jobs...`);
  
  const prediction = new ApplicationPredictionService();
  await prediction.initialize();
  
  // Batch predict
  const predictions = await prediction.batchPredict(jobList, userResume);
  
  // Show top matches
  console.log(`\n=== TOP ${topN} MATCHES ===`);
  predictions.slice(0, topN).forEach((pred, i) => {
    console.log(`\n${i + 1}. ${pred.company} - ${pred.jobTitle}`);
    console.log(`   Match Score: ${pred.matchScore}%`);
    console.log(`   ${pred.recommendation.recommendation}`);
    console.log(`   Action: ${pred.recommendation.action}`);
  });
  
  return predictions;
}

// Example: Find best matches
const jobList = [
  newJob,
  { title: 'Software Engineer', company: 'StartupX', ... },
  { title: 'Senior Engineer', company: 'MegaCorp', ... },
  // ... more jobs
];

// const bestMatches = await findBestMatches(jobList, exampleApplication.resume, 3);

// ============================================================================
// EXAMPLE 7: Complete Workflow
// ============================================================================

async function completeWorkflowExample() {
  console.log('='.repeat(80));
  console.log('COMPLETE WORKFLOW EXAMPLE');
  console.log('='.repeat(80));
  
  // Step 1: User applies to jobs (collect training data)
  console.log('\n[STEP 1] Collecting training data...');
  const app1 = await recordUserApplication(exampleApplication);
  console.log(`✓ Recorded application: ${app1}`);
  
  // Simulate more applications...
  // (In real usage, this happens over time as user applies to jobs)
  
  // Step 2: Update outcomes
  console.log('\n[STEP 2] Updating application outcomes...');
  await updateOutcome(app1, {
    status: 'interview',
    interviewDate: '2025-10-25'
  });
  console.log('✓ Updated outcome: interview');
  
  // Step 3: Train model (once enough data collected)
  console.log('\n[STEP 3] Training ML model...');
  // const report = await trainPredictionModel();
  console.log('✓ Model trained (skipped in example - requires 30+ samples)');
  
  // Step 4: Make prediction for new job
  console.log('\n[STEP 4] Making prediction for new job...');
  // const prediction = await predictJobSuccess(newJob, exampleApplication.resume);
  console.log('✓ Prediction made (requires trained model)');
  
  // Step 5: Generate actionable feedback
  console.log('\n[STEP 5] Generating actionable feedback...');
  // const feedback = await generateActionableFeedback(prediction);
  console.log('✓ Feedback generated (requires prediction)');
  
  console.log('\n' + '='.repeat(80));
  console.log('WORKFLOW COMPLETE');
  console.log('='.repeat(80));
}

// Run complete example
// completeWorkflowExample();

// ============================================================================
// EXAMPLE 8: Chrome Extension Integration
// ============================================================================

// In background.js:
/*
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PREDICT_APPLICATION_SUCCESS') {
    (async () => {
      try {
        const prediction = new ApplicationPredictionService();
        await prediction.initialize();
        
        const result = await prediction.predictApplicationSuccess(
          message.jobPosting,
          message.resume,
          { applicationDate: new Date() }
        );
        
        const feedbackService = new FeedbackGeneratorService();
        const feedback = feedbackService.generateFeedback(result);
        
        sendResponse({
          success: true,
          prediction: result,
          feedback: feedback
        });
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message
        });
      }
    })();
    return true; // Async response
  }
  
  if (message.type === 'RECORD_APPLICATION') {
    (async () => {
      try {
        const trainingData = new TrainingDataService();
        const appId = await trainingData.recordApplication(message.applicationData);
        
        sendResponse({ success: true, applicationId: appId });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
  
  if (message.type === 'UPDATE_OUTCOME') {
    (async () => {
      try {
        const trainingData = new TrainingDataService();
        await trainingData.updateApplicationOutcome(
          message.applicationId,
          message.outcome
        );
        
        // Check if ready for training
        const stats = await trainingData.getDatasetStatistics();
        
        sendResponse({
          success: true,
          readyForTraining: stats.readyForTraining,
          stats: stats
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
  
  if (message.type === 'TRAIN_MODEL') {
    (async () => {
      try {
        const pipeline = new ModelTrainingPipeline();
        const report = await pipeline.runPipeline(message.options);
        
        sendResponse({ success: true, report: report });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
});
*/

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    recordUserApplication,
    updateOutcome,
    trainPredictionModel,
    predictJobSuccess,
    generateActionableFeedback,
    findBestMatches,
    completeWorkflowExample
  };
}

console.log('[Example] ML Application Success Prediction - Integration examples loaded');
console.log('[Example] Use the functions above to test the complete workflow');
