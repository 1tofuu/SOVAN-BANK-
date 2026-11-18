import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BRAND_ASSETS } from '../../constants/app';
import { t } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const lang = useSettingsStore((s) => s.language);

  return (
    <div
      onClick={onContinue}
      role="region"
      aria-label="SOVAN BANK Welcome"
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#E6F8E7] via-[#CEEED1] to-[#7BC089] flex items-center justify-center overflow-hidden cursor-pointer select-none"
    >
      {/* Ambient blurred backdrop for wider screens */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src={BRAND_ASSETS.welcome}
          alt=""
          className="w-full h-full object-cover object-center scale-110 blur-2xl opacity-65"
        />
      </div>

      {/* Main Welcome Artwork Frame */}
      <div className="relative w-full h-full max-w-[500px] sm:max-h-[920px] sm:h-[94dvh] sm:rounded-[32px] overflow-hidden sm:shadow-2xl sm:shadow-[#0E5A3E]/20 sm:border sm:border-white/50 flex flex-col justify-between">
        {/* User-provided welcome artwork */}
        <img
          src={BRAND_ASSETS.welcome}
          alt="SOVAN BANK"
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
        />

        {/* Upper-center Brand Header centered in open area above the wallet */}
        <div className="relative z-10 w-full h-[50%] pt-8 px-6 flex flex-col items-center justify-center text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.26em] text-[#215B40]">
            {t(lang, 'welcome_to')}
          </p>

          <h1 className="mt-1.5 text-3xl sm:text-4xl font-extrabold tracking-[0.12em] text-[#0E5A3E] drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]">
            {t(lang, 'sovan_bank')}
          </h1>

          <div className="w-12 h-1 rounded-full bg-[#C89B3C] mt-3 shadow-xs" />

          <p className="mt-3 text-sm font-medium text-[#2A5E44] max-w-[260px]">
            {t(lang, 'welcome_subtitle')}
          </p>
        </div>

        {/* Bottom Welcome Enter Control */}
        <div className="relative z-10 px-6 pb-8 sm:pb-9 pb-safe flex justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
            className="min-h-[48px] px-7 py-3 rounded-2xl bg-[#0E5A3E]/92 hover:bg-[#0E5A3E] active:scale-[0.98] text-white text-sm font-semibold tracking-wide backdrop-blur-md shadow-lg shadow-[#0E5A3E]/25 inline-flex items-center gap-2 transition-all"
          >
            <span>{t(lang, 'welcome_continue')}</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};
