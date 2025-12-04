// Date utilities
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'relative') {
        return getRelativeTime(d);
    }

    const options: Intl.DateTimeFormatOptions = format === 'long'
        ? { year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };

    return d.toLocaleDateString('en-US', options);
};

export const getRelativeTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(d, 'short');
};

// String utilities
export const truncate = (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
};

export const slugify = (str: string): string => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str: string): string => {
    return str.split(' ').map(capitalize).join(' ');
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const isValidURL = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Data transformation
export const parseResume = (data: any) => {
    // Parse resume data from various formats
    return {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        experience: data.experience || [],
        education: data.education || [],
        skills: data.skills || [],
    };
};

export const formatJobData = (job: any) => {
    return {
        ...job,
        title: job.title?.trim() || '',
        company: job.company?.trim() || '',
        location: job.location?.trim() || 'Remote',
    };
};

// Object utilities
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

export const omit = <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

export const pick = <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in obj) result[key] = obj[key];
    });
    return result;
};

// Array utilities
export const unique = <T>(arr: T[]): T[] => {
    return Array.from(new Set(arr));
};

export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((acc, item) => {
        const group = String(item[key]);
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {} as Record<string, T[]>);
};

// Number utilities
export const formatCurrency = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
};

// Async utilities
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (maxRetries === 0) throw error;
        await sleep(delay);
        return retry(fn, maxRetries - 1, delay * 2);
    }
};

// ============================================
// Security utilities
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHTML = (text: string): string => {
    if (typeof text !== 'string') {
        return '';
    }

    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return text.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char]);
};

/**
 * Sanitize HTML content by removing script tags and dangerous attributes
 */
export const sanitizeHTML = (html: string): string => {
    if (typeof html !== 'string') {
        return '';
    }

    // Remove script tags
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: URIs (potential XSS vector)
    sanitized = sanitized.replace(/data:text\/html[^"']*/gi, '');

    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    // Remove object and embed tags
    sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed\b[^<]*>/gi, '');

    return sanitized;
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename: string): string => {
    if (typeof filename !== 'string') {
        return 'file.txt';
    }

    // Remove path separators and special characters
    let sanitized = filename.replace(/[\/\\]/g, '');

    // Remove dots at the beginning (hidden files)
    sanitized = sanitized.replace(/^\.+/, '');

    // Remove null bytes
    sanitized = sanitized.replace(/\x00/g, '');

    // Limit length
    if (sanitized.length > 255) {
        sanitized = sanitized.substring(0, 255);
    }

    // If empty after sanitization, use default
    if (sanitized.length === 0) {
        return 'file.txt';
    }

    return sanitized;
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Check if content is safe to render
 */
export const isSafeContent = (content: string): boolean => {
    if (typeof content !== 'string') {
        return false;
    }

    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /eval\(/i,
        /expression\(/i,
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
            return false;
        }
    }

    return true;
};

/**
 * Deep clone object safely (prevents prototype pollution)
 */
export const safeClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => safeClone(item)) as unknown as T;
    }

    const cloned: Record<string, any> = {};
    for (const key of Object.keys(obj as object)) {
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
            cloned[key] = safeClone((obj as Record<string, any>)[key]);
        }
    }

    return cloned as T;
};
