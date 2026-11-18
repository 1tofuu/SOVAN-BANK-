import React, { useEffect, useRef, useState } from 'react';
import { Check, Globe, Moon, Sun, User } from 'lucide-react';
import { t } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Currency, Language, ThemeMode } from '../../types';

const LANGUAGE_OPTIONS: readonly { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'km', label: 'ភាសាខ្មែរ' },
];

const CURRENCY_OPTIONS: readonly { id: Currency; label: string }[] = [
  { id: 'USD', label: 'USD ($)' },
  { id: 'KHR', label: 'KHR (៛)' },
];

const SAVED_FEEDBACK_DURATION_MS = 1800;

export const ProfilePreferencesCard: React.FC = () => {
  const name = useSettingsStore((s) => s.name);
  const lang = useSettingsStore((s) => s.language);
  const currency = useSettingsStore((s) => s.currency);
  const theme = useSettingsStore((s) => s.theme);

  const setName = useSettingsStore((s) => s.setName);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const [nameDraft, setNameDraft] = useState(name);
  const [nameSaved, setNameSaved] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setNameDraft(name);
  }, [name]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setName(nameDraft);
    setNameSaved(true);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setNameSaved(false);
      feedbackTimerRef.current = null;
    }, SAVED_FEEDBACK_DURATION_MS);
  };

  const themeOptions: { id: ThemeMode; label: string }[] = [
    { id: 'light', label: t(lang, 'theme_light') },
    { id: 'dark', label: t(lang, 'theme_dark') },
  ];

  return (
    <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 divide-y divide-[#0E5A3E]/10 dark:divide-white/10">
      <div className="p-5">
        <h2 className="text-sm font-semibold text-[#0F1F18] dark:text-[#F1F5F2] mb-4 flex items-center gap-2">
          <User size={16} className="text-[#0E5A3E] dark:text-[#5AD3A3]" />
          <span>{t(lang, 'profile_section')}</span>
        </h2>

        <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="profile-name"
              className="block text-xs font-medium text-[#5B7268] dark:text-[#96ACA1] mb-1.5"
            >
              {t(lang, 'profile_name')}
            </label>
            <input
              id="profile-name"
              type="text"
              maxLength={40}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={t(lang, 'profile_name_placeholder')}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 bg-[#FAFBF9] dark:bg-[#0B120E] text-sm text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#0E5A3E]/30"
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] px-5 rounded-xl bg-[#0E5A3E] hover:bg-[#0B4932] text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            {nameSaved ? <Check size={16} /> : null}
            <span>{nameSaved ? t(lang, 'saved_feedback') : t(lang, 'save_name')}</span>
          </button>
        </form>
      </div>

      {/* Language */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0E5A3E]/10 dark:bg-[#19875D]/20 text-[#0E5A3E] dark:text-[#5AD3A3] flex items-center justify-center shrink-0">
            <Globe size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2]">
              {t(lang, 'language_label')}
            </p>
            <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">English · ភាសាខ្មែរ</p>
          </div>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[#0E5A3E]/8 dark:bg-white/8 self-start sm:self-auto">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLanguage(opt.id)}
              className={`min-h-[38px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                lang === opt.id
                  ? 'bg-[#0E5A3E] text-white'
                  : 'text-[#5B7268] dark:text-[#96ACA1] hover:text-[#0F1F18] dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Currency */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2]">
            {t(lang, 'currency_label')}
          </p>
          <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-0.5">
            {t(lang, 'exchange_rate_note')}
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[#0E5A3E]/8 dark:bg-white/8 self-start sm:self-auto">
          {CURRENCY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCurrency(opt.id)}
              className={`min-h-[38px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                currency === opt.id
                  ? 'bg-[#C89B3C] text-white'
                  : 'text-[#5B7268] dark:text-[#96ACA1] hover:text-[#0F1F18] dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C89B3C]/14 text-[#9A7422] dark:text-[#E5C16C] flex items-center justify-center shrink-0">
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <p className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2]">
            {t(lang, 'appearance_label')}
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-[#0E5A3E]/8 dark:bg-white/8 self-start sm:self-auto">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`min-h-[38px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                theme === opt.id
                  ? 'bg-white dark:bg-[#1B2A22] text-[#0F1F18] dark:text-[#F1F5F2] shadow-xs'
                  : 'text-[#5B7268] dark:text-[#96ACA1] hover:text-[#0F1F18] dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
