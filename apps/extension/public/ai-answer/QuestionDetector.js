/**
 * Question Detector
 * Identifies screening questions on job application pages
 */
class QuestionDetector {
    constructor() {
        this.questions = [];
    }

    /**
     * Detect questions on the page
     * @returns {Array}
     */
    detect() {
        const questions = [];
        // Basic detection logic - look for common patterns
        // This will be enhanced later
        const inputs = document.querySelectorAll('input[type="text"], textarea, select');

        inputs.forEach(input => {
            if (this.isVisible(input)) {
                const label = this.findLabel(input);
                if (label && label.length > 10) { // Filter out short labels like "Name"
                    questions.push({
                        id: input.id || input.name || Math.random().toString(36).substr(2, 9),
                        text: label,
                        type: input.tagName.toLowerCase(),
                        element: input
                    });
                }
            }
        });

        return questions;
    }

    isVisible(element) {
        return element.offsetParent !== null;
    }

    findLabel(input) {
        // 1. Check for label tag with 'for' attribute
        if (input.id) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) return label.innerText.trim();
        }

        // 2. Check for wrapping label
        const parentLabel = input.closest('label');
        if (parentLabel) {
            return parentLabel.innerText.replace(input.value, '').trim();
        }

        // 3. Check for aria-label
        if (input.getAttribute('aria-label')) {
            return input.getAttribute('aria-label');
        }

        // 4. Check for preceding text node
        // ... implementation ...

        return null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionDetector;
}
