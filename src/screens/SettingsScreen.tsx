import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Globe,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { t } from '../i18n/translations';
import { useSettingsStore } from '../stores/settingsStore';
import type { Currency, Language, ThemeMode } from '../types/finance';
import { Modal } from '../components/common/Modal';
import { SovanLogo } from '../components/common/SovanLogo';

export const SettingsScreen: React.FC = () => {
  const name = useSettingsStore((s) => s.name);
  const lang = useSettingsStore((s) => s.language);
  const currency = useSettingsStore((s) => s.currency);
  const theme = useSettingsStore((s) => s.theme);
  const pinEnabled = useSettingsStore((s) => s.pinEnabled);

  const setName = useSettingsStore((s) => s.setName);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const enablePin = useSettingsStore((s) => s.enablePin);
  const disablePin = useSettingsStore((s) => s.disablePin);
  const lockApp = useSettingsStore((s) => s.lockApp);

  const [nameDraft, setNameDraft] = useState(name);
  const [nameSaved, setNameSaved] = useState(false);

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setName(nameDraft);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1800);
  };

  const handleOpenPinSetup = () => {
    setPinInput('');
    setPinError('');
    setPinModalOpen(true);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError(t(lang, 'pin_invalid'));
      return;
    }
    enablePin(pinInput);
    setPinModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
        {t(lang, 'settings_title')}
      </h1>

      {/* Profile & Preferences */}
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
              <p className="text-xs text-[#5B7268] dark:text-[#96ACA1]">
                English · ភាសាខ្មែរ
              </p>
            </div>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-[#0E5A3E]/8 dark:bg-white/8 self-start sm:self-auto">
            {(
              [
                { id: 'en', label: 'English' },
                { id: 'km', label: 'ភាសាខ្មែរ' },
              ] as { id: Language; label: string }[]
            ).map((opt) => (
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
            {(
              [
                { id: 'USD', label: 'USD ($)' },
                { id: 'KHR', label: 'KHR (៛)' },
              ] as { id: Currency; label: string }[]
            ).map((opt) => (
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
            {(
              [
                { id: 'light', label: t(lang, 'theme_light') },
                { id: 'dark', label: t(lang, 'theme_dark') },
              ] as { id: ThemeMode; label: string }[]
            ).map((opt) => (
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

      {/* Security & Data */}
      <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 divide-y divide-[#0E5A3E]/10 dark:divide-white/10">
        <div className="p-5">
          <h2 className="text-sm font-semibold text-[#0F1F18] dark:text-[#F1F5F2] mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#0E5A3E] dark:text-[#5AD3A3]" />
            <span>{t(lang, 'security_section')}</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0E5A3E]/10 dark:bg-[#19875D]/20 text-[#0E5A3E] dark:text-[#5AD3A3] flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={17} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2]">
                  {t(lang, 'app_pin')}
                </p>
                <p className="text-xs text-[#5B7268] dark:text-[#96ACA1] mt-0.5">
                  {t(lang, 'app_pin_desc')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pinEnabled ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenPinSetup}
                    className="min-h-[40px] px-3.5 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 text-xs font-semibold text-[#0F1F18] dark:text-[#F1F5F2] hover:bg-[#0E5A3E]/6 whitespace-nowrap"
                  >
                    {t(lang, 'change_pin')}
                  </button>
                  <button
                    type="button"
                    onClick={lockApp}
                    className="min-h-[40px] px-3.5 rounded-xl bg-[#C89B3C] text-white text-xs font-semibold hover:bg-[#B2882E] whitespace-nowrap"
                  >
                    {t(lang, 'lock_now')}
                  </button>
                  <button
                    type="button"
                    onClick={disablePin}
                    className="min-h-[40px] px-3 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 text-xs font-semibold whitespace-nowrap"
                  >
                    {t(lang, 'delete')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenPinSetup}
                  className="min-h-[40px] px-4 rounded-xl bg-[#0E5A3E] text-white text-xs font-semibold hover:bg-[#0B4932] whitespace-nowrap"
                >
                  {t(lang, 'set_pin')}
                </button>
              )}
            </div>
          </div>
        </div>

      </section>

      {/* About SOVAN */}
      <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-6">
        <div className="flex items-start gap-4">
          <SovanLogo size={46} className="shrink-0" />
          <div className="space-y-3 min-w-0 flex-1">
            <h2 className="text-base font-bold text-[#0F1F18] dark:text-[#F1F5F2]">
              About SOVAN · សុវណ្ណ
            </h2>

            <p className="text-sm leading-relaxed text-[#4A6157] dark:text-[#A3B8AE]">
              SOVAN (សុវណ្ណ, meaning Gold) is a personal finance application inspired by Cambodian heritage and modern financial technology.
            </p>

            <p className="text-sm leading-relaxed text-[#4A6157] dark:text-[#A3B8AE]">
              Designed with simplicity, elegance, and financial clarity in mind, SOVAN helps you manage your money, track expenses, and build better financial habits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#0E5A3E]/10 dark:border-white/10">
              <div>
                <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
                  Founder &amp; Creator
                </p>
                <p className="text-sm font-semibold text-[#0F1F18] dark:text-[#F1F5F2] mt-0.5">
                  Pan Bunheng
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1]">
                  Our Philosophy
                </p>
                <p className="text-sm font-semibold text-[#0E5A3E] dark:text-[#5AD3A3] mt-0.5">
                  Modern Finance. Cambodian Identity.
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-[#5B7268] dark:text-[#96ACA1] pt-1">
              Made with care in Cambodia. 🇰🇭
            </p>
          </div>
        </div>
      </section>

      {/* Set PIN Modal */}
      <Modal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        title={t(lang, 'set_pin')}
        maxWidthClass="sm:max-w-sm"
        onSubmit={handleSavePin}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPinModalOpen(false)}
              className="min-h-[44px] px-4 rounded-xl text-sm font-medium text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/10"
            >
              {t(lang, 'cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none min-h-[44px] px-5 rounded-xl bg-[#0E5A3E] text-white text-sm font-semibold"
            >
              {t(lang, 'save_name')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="pin-setup-input"
              className="block text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] mb-1.5"
            >
              {t(lang, 'enter_pin')}
            </label>
            <input
              id="pin-setup-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4));
                setPinError('');
              }}
              placeholder={t(lang, 'pin_placeholder')}
              className="w-full min-h-[48px] px-4 rounded-xl border border-[#0E5A3E]/18 dark:border-white/14 bg-[#FAFBF9] dark:bg-[#0B120E] text-center text-2xl tracking-[0.5em] font-mono-num text-[#0F1F18] dark:text-[#F1F5F2] focus:outline-none focus:ring-2 focus:ring-[#0E5A3E]/30"
            />
            {pinError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle size={14} />
                <span>{pinError}</span>
              </p>
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};
