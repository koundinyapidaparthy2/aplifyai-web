/**
 * Form Filler for Smart Apply Agent
 * Fills detected form fields with user data.
 */

export class FormFiller {
    constructor(userData) {
        this.userData = userData;
    }

    /**
     * Fill the detected fields
     * @param {Object} detectedFields - Map of field types to DOM elements
     */
    async fill(detectedFields) {
        for (const [type, element] of Object.entries(detectedFields)) {
            const value = this.userData[type];
            if (value) {
                await this.fillField(element, value);
            }
        }
    }

    async fillField(element, value) {
        // Handle different input types
        const tag = element.tagName.toLowerCase();
        const type = element.type?.toLowerCase();

        if (tag === 'select') {
            this.fillSelect(element, value);
        } else if (type === 'checkbox') {
            this.fillCheckbox(element, value);
        } else if (type === 'radio') {
            this.fillRadio(element, value);
        } else if (type === 'file') {
            // File upload requires special handling, usually via trusted event or API
            console.warn('File upload not fully supported in automated filler without user interaction');
        } else {
            // Text inputs
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    fillSelect(element, value) {
        // Try to match option by value or text
        for (const option of element.options) {
            if (option.value === value || option.text.includes(value)) {
                option.selected = true;
                element.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            }
        }
    }

    fillCheckbox(element, value) {
        if (typeof value === 'boolean') {
            element.checked = value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    fillRadio(element, value) {
        // Radio buttons are usually a group, we need to find the right one
        // This logic might need to be in the Agent or Detector to handle groups
        if (element.value === value) {
            element.checked = true;
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}
