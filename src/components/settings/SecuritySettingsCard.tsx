import React, { useState } from 'react';
import { AlertCircle, Lock, ShieldCheck } from 'lucide-react';
import { PIN_LENGTH } from '../../constants/app';
import { t } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';
import { validatePinCode } from '../../utils/validation';
import { Modal } from '../common/Modal';

export const SecuritySettingsCard: React.FC = () => {
  const lang = useSettingsStore((s) => s.language);
  const pinEnabled = useSettingsStore((s) => s.pinEnabled);
  const enablePin = useSettingsStore((s) => s.enablePin);
  const disablePin = useSettingsStore((s) => s.disablePin);
  const lockApp = useSettingsStore((s) => s.lockApp);

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleOpenPinSetup = () => {
    setPinInput('');
    setPinError('');
    setPinModalOpen(true);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePinCode(pinInput, lang);
    if (!validation.valid) {
      setPinError(validation.error);
      return;
    }
    enablePin(validation.value);
    setPinModalOpen(false);
  };

  return (
    <>
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
              maxLength={PIN_LENGTH}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH));
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
    </>
  );
};
