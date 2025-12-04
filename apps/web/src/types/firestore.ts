// Re-export all types from the centralized package
export type {
    // User types
    User,
    UserDocument,
    // Profile types
    ProfileDocument,
    Profile,
    ExperienceItem,
    EducationItem,
    SkillCategory,
    ProjectItem,
    CertificationItem,
    UserPreferences,
    // Job types - Note: JobDocument is the Firestore document type
    JobDocument,
    JobApplicationStatus,
    JobApplication,
    // Resume types
    Resume,
    ResumeDocument,
    // Cover letter types
    CoverLetterDocument,
    CoverLetter,
    // Contact types
    ContactSubmissionDocument,
    // API types
    ApiResponse,
    PaginatedResponse,
} from '@aplifyai/types';

// Re-export enums and constants (not types)
export { JobStatus } from '@aplifyai/types';

// Re-export COLLECTIONS from constants
export { COLLECTIONS } from '@aplifyai/constants';

// For backward compatibility - the web app uses Job as JobDocument
// The generic Job type from @aplifyai/types is for job board parsing
import type { JobDocument } from '@aplifyai/types';
export type Job = JobDocument;
