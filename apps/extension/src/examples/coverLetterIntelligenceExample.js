/**
 * Cover Letter Intelligence Integration Example
 * 
 * Demonstrates how to use all the cover letter intelligence services together.
 */

// Import all services
const CompanyResearchService = require('./services/CompanyResearchService');
const WebScraperService = require('./services/WebScraperService');
const CoverLetterPersonalization = require('./services/CoverLetterPersonalization');
const ToneMatchingService = require('./services/ToneMatchingService');
const CTAVariationService = require('./services/CTAVariationService');
const CoverLetterPrompts = require('./prompts/coverLetterPrompts');

/**
 * Example: Generate Intelligent Cover Letter
 */
async function generateIntelligentCoverLetter(context) {
  const {
    companyName,
    companyWebsite,
    jobTitle,
    jobDescription,
    resume,
    jobAnalysis
  } = context;

  console.log(`\n🚀 Generating intelligent cover letter for ${companyName}`);
  console.log(`Position: ${jobTitle}`);
  console.log(`Website: ${companyWebsite}\n`);

  // Step 1: Research Company
  console.log('📚 Step 1: Researching company...');
  const researcher = new CompanyResearchService({
    googleSearchApiKey: process.env.GOOGLE_SEARCH_API_KEY,
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    enableWebScraping: true
  });

  const companyResearch = await researcher.researchCompany(
    companyName,
    companyWebsite,
    jobTitle
  );

  console.log(`✅ Research complete (confidence: ${Math.round(companyResearch.confidence.overall * 100)}%)`);
  console.log(`   - News: ${companyResearch.news.count} articles found`);
  console.log(`   - Values: ${companyResearch.values?.values?.length || 0} identified`);
  console.log(`   - Culture: ${companyResearch.culture.primary} (${companyResearch.culture.tone} tone)`);
  console.log(`   - Leadership: ${companyResearch.leadership.found ? 'Found' : 'Not found'}`);

  // Step 2: Detect Tone
  console.log('\n🎨 Step 2: Detecting company tone...');
  const toneService = new ToneMatchingService();
  const companyTone = toneService.detectCompanyTone(companyResearch, jobAnalysis);

  console.log(`✅ Tone detected: ${companyTone.primary} (${companyTone.formality}/100 formality)`);
  console.log(`   - Energy: ${companyTone.energy}`);
  console.log(`   - Style: ${companyTone.style}`);
  console.log(`   - Personality: ${companyTone.personality}`);

  // Step 3: Generate with Gemini (using prompt)
  console.log('\n🤖 Step 3: Generating cover letter with Gemini AI...');
  const prompt = CoverLetterPrompts.generatePersonalizedCoverLetter(
    resume,
    jobDescription,
    companyResearch,
    jobAnalysis
  );

  // In production, call Gemini API here
  const geminiResponse = await callGeminiAPI(prompt);
  let coverLetter = geminiResponse.text;

  // Step 4: Personalize (if using base template instead of Gemini)
  console.log('\n✨ Step 4: Personalizing cover letter...');
  const personalization = new CoverLetterPersonalization();

  // If you have a base template instead of Gemini generation:
  // const baseContent = {
  //   opening: "I am excited to apply...",
  //   body: ["Paragraph 1", "Paragraph 2"],
  //   closing: "I look forward to..."
  // };
  // const personalized = await personalization.personalizeCoverLetter(
  //   baseContent,
  //   companyResearch,
  //   jobAnalysis,
  //   resume
  // );
  // coverLetter = personalized.fullLetter;

  // Step 5: Adjust Tone
  console.log('\n🎭 Step 5: Adjusting tone to match company...');
  const adjusted = toneService.adjustCoverLetterTone(coverLetter, companyTone);
  
  console.log(`✅ Tone adjusted (match score: ${adjusted.matchScore}/100)`);
  console.log(`   - Changes made: ${adjusted.changes.length}`);
  if (adjusted.changes.length > 0) {
    console.log(`   - Example: "${adjusted.changes[0].from}" → "${adjusted.changes[0].to}"`);
  }

  coverLetter = adjusted.adjusted;

  // Step 6: Generate CTA Variations
  console.log('\n💬 Step 6: Generating CTA variations...');
  const ctaService = new CTAVariationService();
  const ctas = ctaService.generateCTAVariations({
    companyName,
    companyResearch,
    jobAnalysis,
    resume,
    count: 5
  });

  console.log(`✅ Generated ${ctas.count} CTA variations`);
  console.log(`   - Recommended: ${ctas.recommended.style} (score: ${ctas.recommended.score}/100)`);
  console.log(`   - Preview: "${ctas.recommended.text.slice(0, 80)}..."`);

  // Step 7: Generate Report
  console.log('\n📊 Step 7: Generating personalization report...');
  const report = generateReport(companyResearch, companyTone, adjusted, ctas);

  console.log(`✅ Report generated`);
  console.log(`   - Overall personalization: ${report.personalizationScore}/100`);
  console.log(`   - Research utilization: ${report.researchUtilization}%`);
  console.log(`   - Recommendations: ${report.recommendations.length}`);

  // Return complete result
  return {
    coverLetter: coverLetter,
    research: companyResearch,
    tone: companyTone,
    toneAdjustment: adjusted,
    ctaVariations: ctas,
    report: report,
    metadata: {
      companyName,
      jobTitle,
      generatedAt: new Date().toISOString(),
      processingTime: '~20s'
    }
  };
}

/**
 * Example: Quick personalization of existing cover letter
 */
async function quickPersonalize(existingLetter, companyName, companyWebsite) {
  console.log(`\n⚡ Quick personalizing cover letter for ${companyName}`);

  // Research company
  const researcher = new CompanyResearchService();
  const research = await researcher.researchCompany(companyName, companyWebsite);

  // Use Gemini to enhance
  const prompt = CoverLetterPrompts.enhanceWithResearch(
    existingLetter,
    research,
    {} // minimal job analysis
  );

  const enhanced = await callGeminiAPI(prompt);

  return {
    original: existingLetter,
    enhanced: enhanced.text,
    research: research,
    changes: compareLetters(existingLetter, enhanced.text)
  };
}

/**
 * Example: A/B test CTA variations
 */
async function generateABTest(context) {
  console.log('\n🧪 Generating A/B test CTAs...');

  const ctaService = new CTAVariationService();
  const abTest = ctaService.generateABVariations(context);

  console.log(`✅ A/B Test Generated`);
  console.log(`\nVariant A (${abTest.variantA.style}):`);
  console.log(`"${abTest.variantA.text}"`);
  console.log(`Best for: ${abTest.variantA.bestFor}`);

  console.log(`\nVariant B (${abTest.variantB.style}):`);
  console.log(`"${abTest.variantB.text}"`);
  console.log(`Best for: ${abTest.variantB.bestFor}`);

  console.log(`\nTesting Guide:`);
  console.log(`- Minimum applications: ${abTest.testingGuide.minimumApplications}`);
  console.log(`- Track: ${abTest.testingGuide.metricsToTrack.join(', ')}`);
  console.log(`- Duration: ${abTest.testingGuide.duration}`);

  return abTest;
}

/**
 * Helper: Call Gemini API
 */
async function callGeminiAPI(prompt) {
  // In production, implement actual Gemini API call
  // For now, return mock response
  return {
    text: `[Generated cover letter based on prompt...]\n\nDear Hiring Manager,\n\n${prompt.slice(0, 200)}...`,
    model: 'gemini-pro',
    usage: { tokens: 500 }
  };
}

/**
 * Helper: Generate comprehensive report
 */
function generateReport(research, tone, toneAdjustment, ctas) {
  // Calculate personalization score
  const personalizationScore = Math.round(
    (research.confidence.overall * 30) +
    (research.news.count > 0 ? 20 : 0) +
    (research.values?.values?.length > 0 ? 20 : 0) +
    (research.leadership.found ? 15 : 0) +
    (toneAdjustment.matchScore > 70 ? 15 : 0)
  );

  // Calculate research utilization
  const researchUtilization = Math.round(
    ((research.news.count > 0 ? 25 : 0) +
    (research.values?.values?.length > 0 ? 25 : 0) +
    (research.about?.mission ? 25 : 0) +
    (research.leadership.found ? 25 : 0))
  );

  // Generate recommendations
  const recommendations = [];

  if (!research.leadership.found) {
    recommendations.push({
      priority: 'medium',
      category: 'greeting',
      suggestion: 'Try to find hiring manager on LinkedIn for personalized greeting'
    });
  }

  if (research.news.count === 0) {
    recommendations.push({
      priority: 'low',
      category: 'opening',
      suggestion: 'Company news not found, consider using value-based hook instead'
    });
  }

  if (toneAdjustment.matchScore < 70) {
    recommendations.push({
      priority: 'high',
      category: 'tone',
      suggestion: `Tone match is ${toneAdjustment.matchScore}/100. Consider additional adjustments.`
    });
  }

  return {
    personalizationScore,
    researchUtilization,
    recommendations,
    strengths: [
      research.news.count > 0 ? 'Recent news referenced' : null,
      research.values?.values?.length > 0 ? 'Company values aligned' : null,
      toneAdjustment.matchScore > 80 ? 'Excellent tone match' : null
    ].filter(Boolean),
    weaknesses: [
      !research.leadership.found ? 'Hiring manager not found' : null,
      research.confidence.overall < 0.5 ? 'Low research confidence' : null
    ].filter(Boolean)
  };
}

/**
 * Helper: Compare letters for changes
 */
function compareLetters(original, enhanced) {
  // Simple diff - in production use proper diff algorithm
  return {
    added: enhanced.length - original.length,
    linesChanged: Math.abs(enhanced.split('\n').length - original.split('\n').length),
    significant: enhanced.length > original.length * 1.2
  };
}

// Example usage
async function main() {
  // Example context
  const context = {
    companyName: 'TechCorp',
    companyWebsite: 'https://techcorp.com',
    jobTitle: 'Senior Software Engineer',
    jobDescription: 'We are looking for a Senior Software Engineer...',
    resume: {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234'
      },
      experience: [
        {
          title: 'Software Engineer',
          company: 'Previous Corp',
          startDate: '2020-01',
          endDate: '2024-10',
          responsibilities: [
            'Led development of microservices architecture',
            'Improved system performance by 40%',
            'Mentored team of 5 junior engineers'
          ]
        }
      ],
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS']
    },
    jobAnalysis: {
      jobTitle: 'Senior Software Engineer',
      seniorityLevel: 'senior',
      skills: {
        required: [
          { name: 'JavaScript', importance: 'required' },
          { name: 'React', importance: 'required' }
        ]
      },
      emphasis: {
        primary: 'technical',
        distribution: [{ area: 'technical', percentage: 35 }]
      }
    }
  };

  try {
    // Full intelligent generation
    const result = await generateIntelligentCoverLetter(context);
    
    console.log('\n\n📄 FINAL COVER LETTER:');
    console.log('═'.repeat(80));
    console.log(result.coverLetter);
    console.log('═'.repeat(80));

    console.log('\n📊 REPORT:');
    console.log(`Personalization Score: ${result.report.personalizationScore}/100`);
    console.log(`Research Utilization: ${result.report.researchUtilization}%`);
    console.log(`Strengths: ${result.report.strengths.join(', ')}`);
    if (result.report.weaknesses.length > 0) {
      console.log(`Weaknesses: ${result.report.weaknesses.join(', ')}`);
    }

    console.log('\n✨ Top 3 CTA Alternatives:');
    result.ctaVariations.variations.slice(0, 3).forEach((cta, i) => {
      console.log(`\n${i + 1}. ${cta.style.toUpperCase()} (score: ${cta.score}/100):`);
      console.log(`   "${cta.full}"`);
    });

  } catch (error) {
    console.error('\n❌ Error generating cover letter:', error);
    throw error;
  }
}

// Export for use in extension
module.exports = {
  generateIntelligentCoverLetter,
  quickPersonalize,
  generateABTest
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
