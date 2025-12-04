import { useState, useEffect, useCallback, useRef, useContext, createContext } from 'react';

// ============================================================================
// Auth Context and Hook
// ============================================================================

export interface AuthUser {
    userId: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    tier?: 'free' | 'pro' | 'enterprise';
}

export interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithProvider: (provider: 'google' | 'github' | 'apple') => Promise<void>;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => {},
    loginWithProvider: async () => {},
    loginWithToken: async () => {},
    logout: async () => {},
    refreshToken: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// ============================================================================
// Platform Detection Hook
// ============================================================================

export type Platform = 'web' | 'electron' | 'capacitor' | 'extension';

export function usePlatform(): Platform {
    const [platform, setPlatform] = useState<Platform>('web');
    
    useEffect(() => {
        if (typeof window === 'undefined') {
            setPlatform('web');
            return;
        }
        
        if ((window as any).electronAPI) {
            setPlatform('electron');
        } else if ((window as any).Capacitor?.isNativePlatform?.()) {
            setPlatform('capacitor');
        } else if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
            setPlatform('extension');
        } else {
            setPlatform('web');
        }
    }, []);
    
    return platform;
}

// ============================================================================
// API Hook with Auth
// ============================================================================

export interface APIOptions {
    baseUrl?: string;
    token?: string;
}

export function useAPI(options: APIOptions = {}) {
    const { token: contextToken } = useAuth();
    const platform = usePlatform();
    
    const getBaseUrl = useCallback(() => {
        if (options.baseUrl) return options.baseUrl;
        
        // For native platforms, use the deployed API
        if (platform === 'electron' || platform === 'capacitor') {
            return process.env.NEXT_PUBLIC_API_URL || 'https://api.aplify.ai';
        }
        
        // For web, use relative URLs
        return '';
    }, [options.baseUrl, platform]);
    
    const getHeaders = useCallback(() => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        const token = options.token || contextToken;
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }, [options.token, contextToken]);
    
    const request = useCallback(async <T>(
        endpoint: string,
        init?: RequestInit
    ): Promise<T> => {
        const url = `${getBaseUrl()}${endpoint}`;
        const response = await fetch(url, {
            ...init,
            headers: {
                ...getHeaders(),
                ...init?.headers,
            },
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        return response.json();
    }, [getBaseUrl, getHeaders]);
    
    return {
        get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
        post: <T>(endpoint: string, data?: any) => request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),
        put: <T>(endpoint: string, data?: any) => request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),
        patch: <T>(endpoint: string, data?: any) => request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),
        delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
        request,
    };
}

// ============================================================================
// User Profile Hook
// ============================================================================

export interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    summary?: string;
    skills?: string[];
    experience?: Array<{
        title: string;
        company: string;
        startDate: string;
        endDate?: string;
        description?: string;
    }>;
    education?: Array<{
        degree: string;
        institution: string;
        graduationDate: string;
        gpa?: string;
    }>;
    preferences?: {
        jobTypes?: string[];
        locations?: string[];
        salaryMin?: number;
        salaryMax?: number;
        remote?: boolean;
    };
    tier?: 'free' | 'pro' | 'enterprise';
    createdAt?: string;
    updatedAt?: string;
}

export function useUserProfile() {
    const { isAuthenticated } = useAuth();
    const api = useAPI();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const fetchProfile = useCallback(async () => {
        if (!isAuthenticated) {
            setProfile(null);
            setIsLoading(false);
            return;
        }
        
        try {
            setIsLoading(true);
            const data = await api.get<{ profile: UserProfile }>('/api/profile');
            setProfile(data.profile);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, api]);
    
    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        try {
            const data = await api.patch<{ profile: UserProfile }>('/api/profile', updates);
            setProfile(data.profile);
            return data.profile;
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    }, [api]);
    
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    return {
        profile,
        isLoading,
        error,
        refetch: fetchProfile,
        updateProfile,
    };
}

// ============================================================================
// AI Credits Hook
// ============================================================================

export interface AICredits {
    total: number;
    used: number;
    remaining: number;
    resetDate?: string;
}

export function useAICredits() {
    const { isAuthenticated } = useAuth();
    const api = useAPI();
    const [credits, setCredits] = useState<AICredits | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchCredits = useCallback(async () => {
        if (!isAuthenticated) {
            setCredits(null);
            setIsLoading(false);
            return;
        }
        
        try {
            setIsLoading(true);
            const data = await api.get<AICredits>('/api/credits');
            setCredits(data);
        } catch (err) {
            console.error('Failed to fetch AI credits:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, api]);
    
    const useCredit = useCallback(async (amount: number = 1) => {
        try {
            const data = await api.post<AICredits>('/api/credits/use', { amount });
            setCredits(data);
            return data;
        } catch (err) {
            throw err;
        }
    }, [api]);
    
    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);
    
    return {
        credits,
        isLoading,
        refetch: fetchCredits,
        useCredit,
        hasCredits: (credits?.remaining ?? 0) > 0,
    };
}

// ============================================================================
// Original Hooks (preserved)
// ============================================================================

// useLocalStorage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === 'undefined') return initialValue;
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue] as const;
}

// useDebounce hook
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// useAsync hook
export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async () => {
        setStatus('pending');
        setData(null);
        setError(null);

        try {
            const response = await asyncFunction();
            setData(response);
            setStatus('success');
            return response;
        } catch (error) {
            setError(error as Error);
            setStatus('error');
            throw error;
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { execute, status, data, error, loading: status === 'pending' };
}

// usePrevious hook
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

// useToggle hook
export function useToggle(initialValue = false): [boolean, () => void] {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue(v => !v), []);
    return [value, toggle];
}

// useOnClickOutside hook
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: React.RefObject<T | null>,
    handler: (event: MouseEvent | TouchEvent) => void
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

// useMediaQuery hook
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

// useInterval hook
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}
