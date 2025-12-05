// API Response type (local definition to avoid cross-package dependency issues)
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export class ApiClient {
    private baseURL: string;
    private token?: string;
    private timeout: number;

    constructor(baseURL: string, token?: string, timeout = 30000) {
        this.baseURL = baseURL;
        this.token = token;
        this.timeout = timeout;
    }

    setToken(token: string) {
        this.token = token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Merge existing headers
        if (options.headers) {
            const existingHeaders = options.headers as Record<string, string>;
            Object.assign(headers, existingHeaders);
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || 'Request failed',
                };
            }

            return {
                success: true,
                data: data.data || data,
            };
        } catch (error: any) {
            clearTimeout(timeoutId);
            return {
                success: false,
                error: error.message || 'Network error',
            };
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async upload<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('file', file);

        const headers: Record<string, string> = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || 'Upload failed',
                };
            }

            return {
                success: true,
                data: data.data || data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Upload error',
            };
        }
    }
}

// Create default client
export const createApiClient = (baseURL: string, token?: string) => {
    return new ApiClient(baseURL, token);
};

export * from './GeminiService';
