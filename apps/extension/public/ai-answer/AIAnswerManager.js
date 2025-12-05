/**
 * AI Answer Manager
 * Orchestrates the detection and answering of screening questions
 */
class AIAnswerManager {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.detector = new QuestionDetector();
        this.service = new GeminiService(apiKey);
        this.cache = new AnswerCache();
        this.formFiller = null;
    }

    setFormFiller(filler) {
        this.formFiller = filler;
    }

    async initialize() {
        const questions = this.detector.detect();
        return {
            success: true,
            questionCount: questions.length
        };
    }

    async getQuestionsPreview() {
        return this.detector.detect();
    }

    validateProfile(profile) {
        // Basic validation
        return {
            isComplete: !!(profile && profile.experience && profile.skills),
            missing: []
        };
    }

    async generateAllAnswers(profile, jobData, options) {
        const questions = this.detector.detect();
        const answers = [];
        const errors = [];

        for (const q of questions) {
            try {
                const answer = await this.service.generateAnswer(q.text, { profile, jobData });
                answers.push({ questionId: q.id, answer });
            } catch (err) {
                errors.push({ questionId: q.id, error: err.message });
            }
        }

        return { answers, errors };
    }

    getStatistics() {
        return {
            questionsDetected: 0,
            answersGenerated: 0
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAnswerManager;
}
