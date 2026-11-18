import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  DEFAULT_OPENING_BALANCE_USD,
  DEFAULT_PIN_CODE,
  DEFAULT_THEME,
  DEFAULT_USER_NAME,
  PIN_LENGTH,
  STORAGE_KEYS,
} from '../constants/app';
import { safeStorage } from '../services/storage/safeStorage';
import type {
  Currency,
  CustomCategory,
  Language,
  ThemeMode,
  TransactionType,
  UserSettings,
} from '../types';

interface SettingsState extends UserSettings {
  isLocked: boolean;
  balanceBlurred: boolean;
  customCategories: CustomCategory[];

  setName: (name: string) => void;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleBalanceBlurred: () => void;
  enablePin: (pinCode: string) => void;
  disablePin: () => void;
  lockApp: () => void;
  unlockApp: (attempt: string) => boolean;
  addCustomCategory: (name: string, type: TransactionType) => CustomCategory | null;
  removeCustomCategory: (id: string) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  name: DEFAULT_USER_NAME,
  language: DEFAULT_LANGUAGE,
  currency: DEFAULT_CURRENCY,
  theme: DEFAULT_THEME,
  pinEnabled: false,
  pinCode: DEFAULT_PIN_CODE,
  openingBalanceUSD: DEFAULT_OPENING_BALANCE_USD,
};

const PIN_PATTERN = new RegExp(`^\\d{${PIN_LENGTH}}$`);

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      isLocked: false,
      balanceBlurred: false,
      customCategories: [],

      setName: (name) => set({ name: name.trim() || DEFAULT_USER_NAME }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleBalanceBlurred: () =>
        set((state) => ({ balanceBlurred: !state.balanceBlurred })),

      enablePin: (pinCode) => {
        if (!PIN_PATTERN.test(pinCode)) return;
        set({ pinEnabled: true, pinCode });
      },

      disablePin: () => set({ pinEnabled: false, isLocked: false }),

      lockApp: () => {
        if (get().pinEnabled) {
          set({ isLocked: true });
        }
      },

      unlockApp: (attempt) => {
        if (attempt === get().pinCode) {
          set({ isLocked: false });
          return true;
        }
        return false;
      },

      addCustomCategory: (name, type) => {
        const clean = name.trim();
        if (!clean) return null;

        const existing = get().customCategories.find(
          (c) => c.type === type && c.name.toLowerCase() === clean.toLowerCase()
        );
        if (existing) return existing;

        const created: CustomCategory = {
          id: `cc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
          name: clean,
          type,
        };
        set((state) => ({
          customCategories: [...state.customCategories, created],
        }));
        return created;
      },

      removeCustomCategory: (id) =>
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c.id !== id),
        })),

      resetSettings: () =>
        set({
          ...DEFAULT_SETTINGS,
          isLocked: false,
          balanceBlurred: false,
          customCategories: [],
        }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        name: state.name,
        language: state.language,
        currency: state.currency,
        theme: state.theme,
        pinEnabled: state.pinEnabled,
        pinCode: state.pinCode,
        openingBalanceUSD: state.openingBalanceUSD,
        balanceBlurred: state.balanceBlurred,
        customCategories: state.customCategories,
      }),
      // Require PIN entry immediately on app reload whenever PIN protection is enabled.
      onRehydrateStorage: () => (state) => {
        if (state?.pinEnabled) {
          state.isLocked = true;
        }
      },
    }
  )
);
