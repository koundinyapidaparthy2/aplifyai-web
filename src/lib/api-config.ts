/**
 * API Configuration for Cross-Platform Support
 * 
 * This utility provides the correct API base URL depending on the platform:
 * - Web (development): http://localhost:3000/api
 * - Web (production): /api (relative)
 * - Mobile/Desktop: Uses NEXT_PUBLIC_API_URL environment variable
 */

import { isMobile } from './platform';

const getApiBaseUrl = (): string => {
    // If running in mobile/desktop app, use the deployed API URL
    if (typeof window !== 'undefined' && (isMobile() || (window as any).electron)) {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    }

    // For web, use relative paths
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to construct full API URLs
 */
export const getApiUrl = (endpoint: string): string => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // If API_BASE_URL already ends with /api, don't duplicate it
    if (API_BASE_URL.endsWith('/api')) {
        return `${API_BASE_URL}/${cleanEndpoint}`;
    }

    return `${API_BASE_URL}/api/${cleanEndpoint}`;
};
