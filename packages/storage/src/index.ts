// Storage interface
export interface IStorage {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}

// Secure storage interface (for sensitive data like tokens)
export interface ISecureStorage extends IStorage {
    isSecure: boolean;
}

// Platform detection
export type StoragePlatform = 'web' | 'electron' | 'capacitor' | 'extension';

export function detectStoragePlatform(): StoragePlatform {
    if (typeof window === 'undefined') {
        return 'web';
    }
    
    if ((window as any).electronAPI) {
        return 'electron';
    }
    
    if ((window as any).Capacitor?.isNativePlatform?.()) {
        return 'capacitor';
    }
    
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
        return 'extension';
    }
    
    return 'web';
}

// Browser localStorage implementation
class LocalStorageAdapter implements IStorage {
    async get<T>(key: string): Promise<T | null> {
        try {
            if (typeof window === 'undefined') return null;
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    async remove(key: string): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }

    async clear(): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    }
}

// Chrome extension storage implementation
class ChromeStorageAdapter implements IStorage {
    async get<T>(key: string): Promise<T | null> {
        if (typeof chrome === 'undefined' || !chrome.storage) {
            return null;
        }

        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
            });
        });
    }

    async set<T>(key: string, value: T): Promise<void> {
        if (typeof chrome === 'undefined' || !chrome.storage) {
            return;
        }

        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }

    async remove(key: string): Promise<void> {
        if (typeof chrome === 'undefined' || !chrome.storage) {
            return;
        }

        return new Promise((resolve) => {
            chrome.storage.local.remove(key, () => {
                resolve();
            });
        });
    }

    async clear(): Promise<void> {
        if (typeof chrome === 'undefined' || !chrome.storage) {
            return;
        }

        return new Promise((resolve) => {
            chrome.storage.local.clear(() => {
                resolve();
            });
        });
    }
}

// Capacitor Preferences storage implementation
class CapacitorStorageAdapter implements IStorage {
    private async getPreferences() {
        if (typeof window === 'undefined') return null;
        return (window as any).Capacitor?.Plugins?.Preferences;
    }
    
    async get<T>(key: string): Promise<T | null> {
        try {
            const Preferences = await this.getPreferences();
            if (!Preferences) return null;
            
            const result = await Preferences.get({ key });
            return result.value ? JSON.parse(result.value) : null;
        } catch {
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        try {
            const Preferences = await this.getPreferences();
            if (!Preferences) return;
            
            await Preferences.set({ key, value: JSON.stringify(value) });
        } catch (error) {
            console.error('Capacitor storage set error:', error);
        }
    }

    async remove(key: string): Promise<void> {
        try {
            const Preferences = await this.getPreferences();
            if (!Preferences) return;
            
            await Preferences.remove({ key });
        } catch (error) {
            console.error('Capacitor storage remove error:', error);
        }
    }

    async clear(): Promise<void> {
        try {
            const Preferences = await this.getPreferences();
            if (!Preferences) return;
            
            await Preferences.clear();
        } catch (error) {
            console.error('Capacitor storage clear error:', error);
        }
    }
}

// Electron secure storage implementation
class ElectronStorageAdapter implements ISecureStorage {
    isSecure = true;
    
    private getAPI() {
        if (typeof window === 'undefined') return null;
        return (window as any).electronAPI;
    }
    
    async get<T>(key: string): Promise<T | null> {
        try {
            const api = this.getAPI();
            if (!api?.getSecureValue) {
                // Fallback to localStorage
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            }
            
            const value = await api.getSecureValue(key);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        try {
            const api = this.getAPI();
            if (!api?.setSecureValue) {
                localStorage.setItem(key, JSON.stringify(value));
                return;
            }
            
            await api.setSecureValue(key, JSON.stringify(value));
        } catch (error) {
            console.error('Electron storage set error:', error);
        }
    }

    async remove(key: string): Promise<void> {
        try {
            const api = this.getAPI();
            if (!api?.deleteSecureValue) {
                localStorage.removeItem(key);
                return;
            }
            
            await api.deleteSecureValue(key);
        } catch (error) {
            console.error('Electron storage remove error:', error);
        }
    }

    async clear(): Promise<void> {
        // Electron doesn't have a clear all secure storage method
        // This would need to be implemented in the main process
        console.warn('Electron secure storage clear not implemented');
    }
}

// Factory function to create appropriate storage
export const createStorage = (forceLocal = false): IStorage => {
    if (forceLocal) {
        return new LocalStorageAdapter();
    }
    
    const platform = detectStoragePlatform();
    
    switch (platform) {
        case 'extension':
            return new ChromeStorageAdapter();
        case 'capacitor':
            return new CapacitorStorageAdapter();
        case 'electron':
            return new ElectronStorageAdapter();
        default:
            return new LocalStorageAdapter();
    }
};

// Create secure storage (for auth tokens, API keys)
export const createSecureStorage = (): ISecureStorage => {
    const platform = detectStoragePlatform();
    
    if (platform === 'electron') {
        return new ElectronStorageAdapter();
    }
    
    // For other platforms, use regular storage with a warning
    const baseStorage = createStorage();
    return {
        ...baseStorage,
        isSecure: false,
    };
};

// Default storage instance
export const storage = createStorage();

// Secure storage for sensitive data
export const secureStorage = createSecureStorage();

// ============================================================================
// Auth Storage Keys
// ============================================================================

export const AUTH_STORAGE_KEYS = {
    AUTH_TOKEN: 'aplifyai_auth_token',
    REFRESH_TOKEN: 'aplifyai_refresh_token',
    USER_DATA: 'aplifyai_user_data',
    API_KEY: 'aplifyai_api_key',
    GEMINI_API_KEY: 'geminiApiKey', // Legacy key for extension compatibility
} as const;

// ============================================================================
// Auth Storage Helpers
// ============================================================================

export interface UserData {
    userId: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    tier?: 'free' | 'pro' | 'enterprise';
}

export interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: UserData | null;
    isAuthenticated: boolean;
}

/**
 * Get the current auth state from storage
 */
export async function getAuthState(): Promise<AuthState> {
    const token = await secureStorage.get<string>(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = await secureStorage.get<string>(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const user = await storage.get<UserData>(AUTH_STORAGE_KEYS.USER_DATA);
    
    return {
        token,
        refreshToken,
        user,
        isAuthenticated: !!token && !!user,
    };
}

/**
 * Set auth state in storage
 */
export async function setAuthState(state: Partial<AuthState>): Promise<void> {
    if (state.token !== undefined) {
        if (state.token) {
            await secureStorage.set(AUTH_STORAGE_KEYS.AUTH_TOKEN, state.token);
        } else {
            await secureStorage.remove(AUTH_STORAGE_KEYS.AUTH_TOKEN);
        }
    }
    
    if (state.refreshToken !== undefined) {
        if (state.refreshToken) {
            await secureStorage.set(AUTH_STORAGE_KEYS.REFRESH_TOKEN, state.refreshToken);
        } else {
            await secureStorage.remove(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        }
    }
    
    if (state.user !== undefined) {
        if (state.user) {
            await storage.set(AUTH_STORAGE_KEYS.USER_DATA, state.user);
        } else {
            await storage.remove(AUTH_STORAGE_KEYS.USER_DATA);
        }
    }
}

/**
 * Clear all auth data from storage
 */
export async function clearAuthState(): Promise<void> {
    await secureStorage.remove(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    await secureStorage.remove(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    await storage.remove(AUTH_STORAGE_KEYS.USER_DATA);
}
