import React from 'react';
import { AboutSovanCard } from '../components/settings/AboutSovanCard';
import { ProfilePreferencesCard } from '../components/settings/ProfilePreferencesCard';
import { SecuritySettingsCard } from '../components/settings/SecuritySettingsCard';
import { t } from '../i18n/translations';
import { useSettingsStore } from '../stores/settingsStore';

export const SettingsScreen: React.FC = () => {
  const lang = useSettingsStore((s) => s.language);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
        {t(lang, 'settings_title')}
      </h1>

      <ProfilePreferencesCard />
      <SecuritySettingsCard />
      <AboutSovanCard />
    </div>
  );
};
