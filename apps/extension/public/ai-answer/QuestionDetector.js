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
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], textarea, select');

        inputs.forEach(input => {
            if (this.isVisible(input)) {
                const label = this.findLabel(input);
                if (label && label.length > 3) { // Lowered threshold slightly to catch short but valid labels like "Bio"
                    const fieldData = {
                        id: input.id || input.name || Math.random().toString(36).substr(2, 9),
                        name: input.name || '',
                        text: label,
                        placeholder: input.placeholder || '',
                        value: input.value || '',
                        type: input.tagName.toLowerCase(),
                        inputType: input.type || '',
                        required: input.required || input.getAttribute('aria-required') === 'true',
                        element: input
                    };

                    // For select elements, capture options
                    if (input.tagName.toLowerCase() === 'select') {
                        fieldData.options = Array.from(input.options).map(opt => ({
                            value: opt.value,
                            text: opt.textContent.trim(),
                            selected: opt.selected
                        }));
                    }

                    questions.push(fieldData);
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
            // Clone to avoid modifying actual DOM when getting text
            const clone = parentLabel.cloneNode(true);
            // Remove the input itself from the clone to get just text
            const childInput = clone.querySelector('input, textarea, select');
            if (childInput) childInput.remove();
            return clone.innerText.trim();
        }

        // 3. Check for aria-label
        if (input.getAttribute('aria-label')) {
            return input.getAttribute('aria-label');
        }

        // 4. Check for preceding text node (simple heuristic)
        // often found in table layouts or simple forms
        let previous = input.previousSibling;
        while (previous && previous.nodeType === 3 && previous.textContent.trim() === '') {
            previous = previous.previousSibling;
        }
        if (previous && previous.nodeType === 1 && previous.tagName === 'LABEL') {
            return previous.innerText.trim();
        }

        return null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionDetector;
}
