/**
 * Application Flow Service (REVISED)
 * Orchestrates the 5-step job application process
 * 
 * Step Order:
 * 1. Collect Data - Extract job details from page
 * 2. Fill Generic Questions - Use cached profile (INSTANT)
 * 3. Generate PDFs - Call resume-generator service
 * 4. Fill AI Questions - Use generated JSONs
 * 5. Verify & Scroll - Check completeness, scroll to submit
 */

const STEPS = {
    COLLECT_DATA: 1,
    FILL_GENERIC_QUESTIONS: 2,
    GENERATE_DOCUMENTS: 3,
    FILL_AI_QUESTIONS: 4,
    VERIFY_AND_RETRY: 5,
};

class ApplicationFlowService {
    constructor() {
        this.currentStep = 0;
        this.progress = 0;
        this.stepStatuses = {};
        this.errors = {};
        this.listeners = [];
        this.jobData = null;
        this.userProfile = null;
        this.generatedFiles = {
            resumePdf: null,
            coverLetterPdf: null,
            resumeJson: null,      // IMPORTANT: Store JSON for AI questions
            coverLetterJson: null, // IMPORTANT: Store JSON for AI questions
        };
    }

    /**
     * Subscribe to flow updates
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all listeners of state change
     */
    notify() {
        const state = {
            currentStep: this.currentStep,
            progress: this.progress,
            stepStatuses: { ...this.stepStatuses },
            errors: { ...this.errors },
        };
        this.listeners.forEach(callback => callback(state));
    }

    /**
     * Update step status
     */
    updateStep(stepId, status, error = null) {
        this.currentStep = stepId;
        this.stepStatuses[stepId] = status;
        if (error) {
            this.errors[stepId] = error;
        } else {
            delete this.errors[stepId];
        }
        this.notify();
    }

    /**
     * Update progress percentage
     */
    updateProgress(percent) {
        this.progress = Math.min(100, Math.max(0, percent));
        this.notify();
    }

    /**
     * Start the application flow (REVISED ORDER)
     */
    async startApplication(jobData, userProfile) {
        try {
            this.jobData = jobData;
            this.userProfile = userProfile;
            this.currentStep = 0;
            this.progress = 0;
            this.stepStatuses = {};
            this.errors = {};
            this.generatedFiles = {
                resumePdf: null,
                coverLetterPdf: null,
                resumeJson: null,
                coverLetterJson: null,
            };

            // Step 1: Collect Data (0-10%)
            await this.executeStep1();

            // Step 2: Fill Generic Questions (10-30%) - INSTANT using cached profile
            await this.executeStep2();

            // Step 3: Generate Documents (30-70%) - Call resume-generator service
            await this.executeStep3();

            // Step 4: Fill AI Questions (70-90%) - Use generated JSONs
            await this.executeStep4();

            // Step 5: Verify and Retry (90-100%)
            await this.executeStep5();

            // Complete
            this.updateProgress(100);
            console.log('[ApplicationFlow] Application flow completed successfully');

        } catch (error) {
            console.error('[ApplicationFlow] Flow failed:', error);
            throw error;
        }
    }

    /**
     * Step 1: Collect Data
     */
    async executeStep1() {
        this.updateStep(STEPS.COLLECT_DATA, 'active');
        this.updateProgress(0);

        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Request job data from content script (already collected)
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'COLLECT_ADDITIONAL_DATA',
            });

            if (response.success) {
                this.jobData = { ...this.jobData, ...response.data };
            }

            this.updateStep(STEPS.COLLECT_DATA, 'complete');
            this.updateProgress(10);

        } catch (error) {
            this.updateStep(STEPS.COLLECT_DATA, 'error', error.message);
            throw error;
        }
    }

    /**
     * Step 2: Fill Generic Questions (INSTANT - using cached profile)
     */
    async executeStep2() {
        this.updateStep(STEPS.FILL_GENERIC_QUESTIONS, 'active');
        this.updateProgress(10);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Get cached user profile (instant - no backend call)
            const profileResponse = await chrome.runtime.sendMessage({
                action: 'GET_CACHED_USER_PROFILE',
            });

            if (!profileResponse.success || !profileResponse.data) {
                throw new Error('No cached profile available');
            }

            const profile = profileResponse.data;

            // Fill generic form fields immediately
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'FILL_GENERIC_QUESTIONS',
                data: { profile },
            });

            if (!response.success) {
                throw new Error('Failed to fill generic questions');
            }

            this.updateStep(STEPS.FILL_GENERIC_QUESTIONS, 'complete');
            this.updateProgress(30);

        } catch (error) {
            this.updateStep(STEPS.FILL_GENERIC_QUESTIONS, 'error', error.message);
            throw error;
        }
    }

    /**
     * Step 3: Generate Documents (Resume + Cover Letter PDFs)
     */
    async executeStep3() {
        this.updateStep(STEPS.GENERATE_DOCUMENTS, 'active');
        this.updateProgress(30);

        try {
            // Generate resume + cover letter via resume-generator service
            const resumeResponse = await chrome.runtime.sendMessage({
                action: 'GENERATE_TAILORED_RESUME',
                data: {
                    jobData: this.jobData,
                    userProfile: this.userProfile,
                },
            });

            if (!resumeResponse.success) {
                throw new Error('Failed to generate resume');
            }

            // Store both PDF and JSON
            this.generatedFiles.resumePdf = resumeResponse.pdfUrl;
            this.generatedFiles.resumeJson = resumeResponse.jsonResponse;

            this.updateProgress(50);

            // Generate cover letter
            const coverLetterResponse = await chrome.runtime.sendMessage({
                action: 'GENERATE_COVER_LETTER',
                data: {
                    jobData: this.jobData,
                    userProfile: this.userProfile,
                    resumeJson: this.generatedFiles.resumeJson, // Pass resume JSON
                },
            });

            if (!coverLetterResponse.success) {
                throw new Error('Failed to generate cover letter');
            }

            this.generatedFiles.coverLetterPdf = coverLetterResponse.pdfUrl;
            this.generatedFiles.coverLetterJson = coverLetterResponse.jsonResponse;

            // Download PDFs and attach to form
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, {
                action: 'ATTACH_FILES',
                data: {
                    resumeUrl: this.generatedFiles.resumePdf,
                    coverLetterUrl: this.generatedFiles.coverLetterPdf,
                },
            });

            this.updateStep(STEPS.GENERATE_DOCUMENTS, 'complete');
            this.updateProgress(70);

        } catch (error) {
            this.updateStep(STEPS.GENERATE_DOCUMENTS, 'error', error.message);
            throw error;
        }
    }

    /**
     * Step 4: Fill AI Questions (using generated JSONs)
     */
    async executeStep4() {
        this.updateStep(STEPS.FILL_AI_QUESTIONS, 'active');
        this.updateProgress(70);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Fill AI-powered questions using generated JSONs
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'FILL_AI_QUESTIONS',
                data: {
                    jobData: this.jobData,
                    resumeJson: this.generatedFiles.resumeJson,
                    coverLetterJson: this.generatedFiles.coverLetterJson,
                },
            });

            if (!response.success) {
                throw new Error('Failed to fill AI questions');
            }

            this.updateStep(STEPS.FILL_AI_QUESTIONS, 'complete');
            this.updateProgress(90);

        } catch (error) {
            this.updateStep(STEPS.FILL_AI_QUESTIONS, 'error', error.message);
            throw error;
        }
    }

    /**
     * Step 5: Verify and Retry
     */
    async executeStep5() {
        this.updateStep(STEPS.VERIFY_AND_RETRY, 'active');
        this.updateProgress(90);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Verify required fields
            const verifyResponse = await chrome.tabs.sendMessage(tab.id, {
                action: 'VERIFY_REQUIRED_FIELDS',
            });

            if (!verifyResponse.success) {
                throw new Error('Failed to verify fields');
            }

            const { missingRequired, missingOptional } = verifyResponse.data;

            // If there are missing required fields, retry filling
            if (missingRequired.length > 0) {
                console.log('[ApplicationFlow] Found missing required fields, retrying...');

                // Retry generic questions
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'FILL_GENERIC_QUESTIONS',
                    data: {
                        profile: this.userProfile,
                        retryOnly: missingRequired,
                    },
                });

                this.updateProgress(93);

                // Retry AI questions
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'FILL_AI_QUESTIONS',
                    data: {
                        jobData: this.jobData,
                        resumeJson: this.generatedFiles.resumeJson,
                        coverLetterJson: this.generatedFiles.coverLetterJson,
                        retryOnly: missingRequired,
                    },
                });

                this.updateProgress(96);

                // Verify again
                const retryVerifyResponse = await chrome.tabs.sendMessage(tab.id, {
                    action: 'VERIFY_REQUIRED_FIELDS',
                });

                if (retryVerifyResponse.data.missingRequired.length > 0) {
                    console.warn('[ApplicationFlow] Still have missing fields after retry:', retryVerifyResponse.data.missingRequired);
                }
            }

            // Scroll to submit button
            await chrome.tabs.sendMessage(tab.id, {
                action: 'SCROLL_TO_SUBMIT',
            });

            this.updateStep(STEPS.VERIFY_AND_RETRY, 'complete');
            this.updateProgress(100);

        } catch (error) {
            this.updateStep(STEPS.VERIFY_AND_RETRY, 'error', error.message);
            throw error;
        }
    }

    /**
     * Reset the flow
     */
    reset() {
        this.currentStep = 0;
        this.progress = 0;
        this.stepStatuses = {};
        this.errors = {};
        this.jobData = null;
        this.userProfile = null;
        this.generatedFiles = {
            resumePdf: null,
            coverLetterPdf: null,
            resumeJson: null,
            coverLetterJson: null,
        };
        this.notify();
    }
}

// Export singleton instance
const applicationFlowService = new ApplicationFlowService();
export default applicationFlowService;
export { STEPS };
