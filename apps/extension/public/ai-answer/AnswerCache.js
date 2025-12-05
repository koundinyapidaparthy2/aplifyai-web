/**
 * Answer Cache
 * Caches generated answers to save tokens and time
 */
class AnswerCache {
    constructor() {
        this.cache = {};
    }

    get(questionText) {
        return this.cache[this.hash(questionText)];
    }

    set(questionText, answer) {
        this.cache[this.hash(questionText)] = answer;
    }

    hash(text) {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnswerCache;
}
