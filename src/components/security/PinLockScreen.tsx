import React, { useState } from 'react';
import { Delete, Lock } from 'lucide-react';
import { t } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';
import { SovanLogo } from '../common/SovanLogo';

export const PinLockScreen: React.FC = () => {
  const lang = useSettingsStore((s) => s.language);
  const unlockApp = useSettingsStore((s) => s.unlockApp);
  const [digits, setDigits] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setError(false);

    if (next.length === 4) {
      const ok = unlockApp(next);
      if (!ok) {
        setError(true);
        setTimeout(() => setDigits(''), 350);
      }
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
    setError(false);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  return (
    <div className="fixed inset-0 z-50 bg-[#E9F4EA] dark:bg-[#0B120E] flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src="/assets/aistudio/bg3_c6f8d03b.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="hidden dark:block absolute inset-0 bg-[#0B120E]/50" />
      </div>

      <div className="relative z-10 w-full max-w-[260px] flex flex-col items-center text-center space-y-6">
        {/* Top Unlock Header (No blur container) */}
        <div className="w-full flex flex-col items-center space-y-3.5">
          <SovanLogo size={56} className="shadow-md" />

          <div>
            <h1 className="text-xl font-bold text-[#0B2419] dark:text-[#F1F5F2] drop-shadow-[0_1px_2px_rgba(255,255,255,0.75)] dark:drop-shadow-none">
              {t(lang, 'unlock_sovan')}
            </h1>
            <p className="text-xs font-medium text-[#1E4634] dark:text-[#B8CCC1] mt-1 flex items-center justify-center gap-1.5 drop-shadow-[0_1px_2px_rgba(255,255,255,0.75)] dark:drop-shadow-none">
              <Lock size={13} />
              <span>{t(lang, 'enter_pin')}</span>
            </p>
          </div>

          {/* 4-dot PIN indicator */}
          <div className="flex items-center justify-center gap-4 pt-1">
            {[0, 1, 2, 3].map((idx) => {
              const filled = idx < digits.length;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    error
                      ? 'border-red-500 bg-red-500'
                      : filled
                      ? 'border-[#0E5A3E] bg-[#0E5A3E] dark:border-[#C89B3C] dark:bg-[#C89B3C]'
                      : 'border-[#0E5A3E]/55 dark:border-white/40 bg-transparent'
                  }`}
                />
              );
            })}
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {t(lang, 'pin_incorrect')}
            </p>
          )}
        </div>

        {/* Circular Frosted-Blur Numeric Keypad */}
        <div className="grid grid-cols-3 gap-4 place-items-center w-full">
          {keys.map((k, idx) => {
            if (k === '') return <div key={`empty-${idx}`} className="w-16 h-16" />;
            if (k === 'back') {
              return (
                <button
                  key="back"
                  type="button"
                  onClick={handleBackspace}
                  aria-label="Backspace"
                  className="w-16 h-16 rounded-full bg-white/28 dark:bg-[#0B120E]/45 backdrop-blur-xl backdrop-saturate-150 border border-white/45 dark:border-white/15 flex items-center justify-center text-[#0B2419] dark:text-[#F1F5F2] hover:bg-white/45 dark:hover:bg-white/15 active:scale-95 transition-all shadow-sm"
                >
                  <Delete size={20} />
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleDigit(k)}
                className="w-16 h-16 rounded-full bg-white/28 dark:bg-[#0B120E]/45 backdrop-blur-xl backdrop-saturate-150 border border-white/45 dark:border-white/15 text-xl font-semibold font-mono-num text-[#0B2419] dark:text-[#F1F5F2] hover:bg-white/45 dark:hover:bg-white/15 active:scale-95 transition-all shadow-sm flex items-center justify-center"
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
