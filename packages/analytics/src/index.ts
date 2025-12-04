// Analytics interface
interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp?: Date;
}

class Analytics {
    private enabled: boolean = true;
    private userId?: string;

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    identify(userId: string, traits?: Record<string, any>) {
        if (!this.enabled) return;

        this.userId = userId;
        console.log('[Analytics] Identify:', userId, traits);

        // Integrate with Google Analytics, Mixpanel, etc.
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('set', 'user_id', userId);
            if (traits) {
                (window as any).gtag('set', 'user_properties', traits);
            }
        }
    }

    track(event: string, properties?: Record<string, any>) {
        if (!this.enabled) return;

        const analyticsEvent: AnalyticsEvent = {
            name: event,
            properties: {
                ...properties,
                userId: this.userId,
            },
            timestamp: new Date(),
        };

        console.log('[Analytics] Track:', analyticsEvent);

        // Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', event, properties);
        }

        // You can add more analytics providers here
    }

    page(name: string, properties?: Record<string, any>) {
        if (!this.enabled) return;

        console.log('[Analytics] Page:', name, properties);

        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'page_view', {
                page_title: name,
                ...properties,
            });
        }
    }

    reset() {
        this.userId = undefined;
        console.log('[Analytics] Reset');
    }
}

export const analytics = new Analytics();

// Event names constants
export const EVENTS = {
    // Auth
    LOGIN: 'login',
    SIGNUP: 'signup',
    LOGOUT: 'logout',

    // Jobs
    JOB_VIEWED: 'job_viewed',
    JOB_SAVED: 'job_saved',
    JOB_APPLIED: 'job_applied',

    // Resumes
    RESUME_GENERATED: 'resume_generated',
    RESUME_DOWNLOADED: 'resume_downloaded',

    // Extension
    EXTENSION_INSTALLED: 'extension_installed',
    AUTO_FILL_USED: 'auto_fill_used',
    AI_ANSWER_GENERATED: 'ai_answer_generated',
} as const;
