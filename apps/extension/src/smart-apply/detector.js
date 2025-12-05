/**
 * Form Detector for Smart Apply Agent
 * Identifies form fields and maps them to user profile data.
 */

export class FormDetector {
    constructor() {
        this.fieldMappings = {
            firstName: ['first name', 'firstname', 'given name', 'fname'],
            lastName: ['last name', 'lastname', 'family name', 'lname'],
            fullName: ['full name', 'fullname', 'name'],
            email: ['email', 'e-mail', 'email address'],
            phone: ['phone', 'mobile', 'cell', 'telephone'],
            linkedin: ['linkedin', 'linkedin profile', 'linkedin url'],
            website: ['website', 'portfolio', 'personal site'],
            resume: ['resume', 'cv', 'curriculum vitae'],
            coverLetter: ['cover letter', 'coverletter'],
        };
    }

    /**
     * Scan the page for form fields
     * @returns {Object} Detected fields mapped to types
     */
    scan() {
        const detectedFields = {};
        const inputs = document.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            const type = this.identifyField(input);
            if (type) {
                detectedFields[type] = input;
            }
        });

        return detectedFields;
    }

    /**
     * Identify the type of a specific input field
     * @param {HTMLElement} input 
     * @returns {string|null} Field type or null
     */
    identifyField(input) {
        // 1. Check attributes (id, name, label, placeholder)
        const attributes = [
            input.id,
            input.name,
            input.getAttribute('aria-label'),
            input.placeholder
        ].filter(Boolean).map(s => s.toLowerCase());

        // 2. Check associated label
        const label = this.findLabel(input);
        if (label) {
            attributes.push(label.textContent.toLowerCase());
        }

        // 3. Match against mappings
        for (const [type, keywords] of Object.entries(this.fieldMappings)) {
            if (keywords.some(keyword => attributes.some(attr => attr.includes(keyword)))) {
                return type;
            }
        }

        return null;
    }

    findLabel(input) {
        // 1. Implicit label (parent)
        if (input.parentElement.tagName === 'LABEL') {
            return input.parentElement;
        }
        // 2. Explicit label (for attribute)
        if (input.id) {
            return document.querySelector(`label[for="${input.id}"]`);
        }
        return null;
    }
}
