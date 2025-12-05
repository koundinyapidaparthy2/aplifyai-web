import { FormDetector } from './detector';
import { FormFiller } from './filler';

export class SmartApplyAgent {
    constructor(userData) {
        this.userData = userData;
        this.detector = new FormDetector();
        this.filler = new FormFiller(userData);
        this.status = 'idle'; // idle, scanning, filling, completed, error
    }

    /**
     * Start the auto-apply process on the current page
     */
    async start() {
        try {
            this.status = 'scanning';
            console.log('Smart Apply: Scanning page...');

            const fields = this.detector.scan();
            const fieldCount = Object.keys(fields).length;

            if (fieldCount === 0) {
                console.log('Smart Apply: No fields detected.');
                this.status = 'error';
                return { success: false, message: 'No supported fields found.' };
            }

            console.log(`Smart Apply: Found ${fieldCount} fields. Filling...`);
            this.status = 'filling';

            await this.filler.fill(fields);

            this.status = 'completed';
            console.log('Smart Apply: Filling complete.');
            return { success: true, fieldsFilled: fieldCount };

        } catch (error) {
            console.error('Smart Apply Error:', error);
            this.status = 'error';
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate AI answer for a specific question (Placeholder)
     * @param {string} question 
     */
    async generateAnswer(question) {
        // TODO: Integrate with LLM service
        return `This is a generated answer for: ${question}`;
    }
}
