// Feature flags storage key
const FLAGS_STORAGE_KEY = 'feature_flags';

// Default flags
const DEFAULT_FLAGS: Record<string, boolean> = {
    aiAnswers: true,
    autoFill: true,
    coverLetterGen: true,
    jobTracker: true,
    analytics: false,
    darkMode: true,
    notifications: true,
};

class FeatureFlags {
    private flags: Record<string, boolean> = { ...DEFAULT_FLAGS };

    constructor() {
        this.loadFlags();
    }

    private loadFlags() {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(FLAGS_STORAGE_KEY);
            if (stored) {
                this.flags = { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Failed to load feature flags:', error);
        }
    }

    private saveFlags() {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(this.flags));
        } catch (error) {
            console.error('Failed to save feature flags:', error);
        }
    }

    isEnabled(flag: string): boolean {
        return this.flags[flag] ?? false;
    }

    enable(flag: string) {
        this.flags[flag] = true;
        this.saveFlags();
    }

    disable(flag: string) {
        this.flags[flag] = false;
        this.saveFlags();
    }

    toggle(flag: string) {
        this.flags[flag] = !this.flags[flag];
        this.saveFlags();
    }

    getAll(): Record<string, boolean> {
        return { ...this.flags };
    }

    reset() {
        this.flags = { ...DEFAULT_FLAGS };
        this.saveFlags();
    }
}

export const featureFlags = new FeatureFlags();

// React hook for feature flags
export const useFeatureFlag = (flag: string): boolean => {
    if (typeof window === 'undefined') return false;
    return featureFlags.isEnabled(flag);
};

// Flag names constants
export const FLAGS = {
    AI_ANSWERS: 'aiAnswers',
    AUTO_FILL: 'autoFill',
    COVER_LETTER_GEN: 'coverLetterGen',
    JOB_TRACKER: 'jobTracker',
    ANALYTICS: 'analytics',
    DARK_MODE: 'darkMode',
    NOTIFICATIONS: 'notifications',
} as const;
