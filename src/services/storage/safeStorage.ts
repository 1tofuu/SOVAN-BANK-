import type { StateStorage } from 'zustand/middleware';

const memoryFallback = new Map<string, string>();

/**
 * Resilient storage adapter for Zustand persist middleware.
 * Protects against restricted localStorage (private browsing, quota exceeded, SSR/test runtimes)
 * by falling back cleanly to an in-memory map instead of crashing the app.
 */
export const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
    } catch {
      // Fall through to in-memory storage
    }
    return memoryFallback.get(name) ?? null;
  },

  setItem: (name: string, value: string): void => {
    memoryFallback.set(name, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
      }
    } catch {
      // Retain in-memory fallback when localStorage is unavailable or full
    }
  },

  removeItem: (name: string): void => {
    memoryFallback.delete(name);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
      }
    } catch {
      // Ignore storage access errors on removal
    }
  },
};
