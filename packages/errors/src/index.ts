// Custom error classes
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ValidationError extends Error {
    constructor(
        public field: string,
        message: string,
        public value?: any
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends Error {
    constructor(message: string = 'Authentication required') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class NotFoundError extends Error {
    constructor(resource: string) {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
    }
}

// Error handler
export const handleError = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof ValidationError) {
        return `${error.field}: ${error.message}`;
    }

    if (error instanceof AuthenticationError) {
        return 'Please log in to continue';
    }

    if (error instanceof NotFoundError) {
        return error.message;
    }

    if (error instanceof NetworkError) {
        return 'Network error. Please check your connection.';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

// Error logger
export const logError = (error: unknown, context?: Record<string, any>) => {
    console.error('[Error]', error, context);

    // Send to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, { extra: context });
    }
};
