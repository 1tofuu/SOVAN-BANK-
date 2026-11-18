import React from 'react';
import {
  BarChart3,
  Clock,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Plus,
  Settings,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { BRAND_ASSETS } from '../../constants/app';
import { t, type TranslationKey } from '../../i18n/translations';
import { useSettingsStore } from '../../stores/settingsStore';
import type { AppTab, Language } from '../../types';
import { SovanLogo } from '../common/SovanLogo';

interface NavItemConfig {
  id: AppTab;
  labelKey: TranslationKey;
  icon: LucideIcon;
}

const DESKTOP_NAV_ITEMS: readonly NavItemConfig[] = [
  { id: 'dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard },
  { id: 'history', labelKey: 'nav_history', icon: Clock },
  { id: 'budget', labelKey: 'nav_budget', icon: PiggyBank },
  { id: 'analytics', labelKey: 'nav_analytics', icon: BarChart3 },
  { id: 'settings', labelKey: 'nav_settings', icon: Settings },
];

const MOBILE_LEFT_TABS: readonly NavItemConfig[] = DESKTOP_NAV_ITEMS.slice(0, 2);
const MOBILE_RIGHT_TABS: readonly NavItemConfig[] = DESKTOP_NAV_ITEMS.slice(2, 4);

interface MobileTabButtonProps {
  item: NavItemConfig;
  active: boolean;
  lang: Language;
  onSelect: (tab: AppTab) => void;
}

const MobileTabButton: React.FC<MobileTabButtonProps> = ({
  item,
  active,
  lang,
  onSelect,
}) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
        active
          ? 'text-[#0E5A3E] dark:text-[#5AD3A3]'
          : 'text-[#5B7268] dark:text-[#96ACA1]'
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
      <span className="text-[10px] font-medium truncate max-w-[64px]">
        {t(lang, item.labelKey)}
      </span>
    </button>
  );
};

interface AppShellProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAdd: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onSelectTab,
  onOpenAdd,
  children,
}) => {
  const lang = useSettingsStore((s) => s.language);
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  return (
    <div className="relative min-h-screen bg-[#E9F4EA] dark:bg-[#0B120E] text-[#0F1F18] dark:text-[#F1F5F2] flex flex-col lg:flex-row">
      {/* Cambodian Heritage Background Artwork */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src={BRAND_ASSETS.background}
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-[#FAFBF9]/35 to-white/60 dark:from-[#0B120E]/86 dark:via-[#0B120E]/82 dark:to-[#0B120E]/92 transition-colors" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white/86 dark:bg-[#121C16]/88 backdrop-blur-md border-r border-[#0E5A3E]/12 dark:border-white/10 p-5 justify-between z-30">
        <div className="space-y-7">
          {/* Brand */}
          <div className="flex items-center gap-3 px-1">
            <SovanLogo size={38} />
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2] leading-none">
                SOVAN
              </p>
            </div>
          </div>

          {/* Primary Add CTA */}
          <button
            type="button"
            onClick={onOpenAdd}
            className="w-full min-h-[46px] px-4 rounded-xl bg-[#0E5A3E] hover:bg-[#0B4932] active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs whitespace-nowrap"
          >
            <Plus size={18} />
            <span>{t(lang, 'add_transaction')}</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main navigation">
            {DESKTOP_NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full min-h-[44px] px-3.5 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#0E5A3E]/10 dark:bg-[#19875D]/20 text-[#0E5A3E] dark:text-[#5AD3A3] font-semibold'
                      : 'text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/5 dark:hover:bg-white/6 hover:text-[#0F1F18] dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="truncate">{t(lang, item.labelKey)}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Theme Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full min-h-[44px] px-3.5 rounded-xl border border-[#0E5A3E]/12 dark:border-white/10 text-xs font-medium text-[#4A6157] dark:text-[#A3B8AE] hover:text-[#0F1F18] dark:hover:text-white flex items-center justify-between transition-colors"
        >
          <span>{theme === 'light' ? t(lang, 'theme_light') : t(lang, 'theme_dark')}</span>
          {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </aside>

      {/* Mobile Compact Sticky Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 px-4 bg-transparent backdrop-blur-xl backdrop-saturate-150 border-b border-[#0E5A3E]/12 dark:border-white/12 flex items-center justify-between pt-safe">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 min-h-[44px] whitespace-nowrap"
        >
          <SovanLogo size={30} />
          <span className="text-base font-bold tracking-tight text-[#0F1F18] dark:text-[#F1F5F2]">
            SOVAN
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t(lang, 'appearance_label')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/8"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            aria-label={t(lang, 'nav_settings')}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#0E5A3E]/10 dark:bg-[#19875D]/20 text-[#0E5A3E] dark:text-[#5AD3A3]'
                : 'text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/8'
            }`}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 lg:pl-64 pb-24 lg:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Fixed Bottom Tab Bar (Thumb Zone) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121C16]/95 backdrop-blur-md border-t border-[#0E5A3E]/12 dark:border-white/10 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {MOBILE_LEFT_TABS.map((item) => (
            <MobileTabButton
              key={item.id}
              item={item}
              active={activeTab === item.id}
              lang={lang}
              onSelect={onSelectTab}
            />
          ))}

          {/* Center Quick Add Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={onOpenAdd}
              aria-label={t(lang, 'add_transaction')}
              className="w-12 h-12 rounded-2xl bg-[#C89B3C] hover:bg-[#B2882E] active:scale-95 text-white flex items-center justify-center shadow-md shadow-[#C89B3C]/25 transition-all"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>

          {MOBILE_RIGHT_TABS.map((item) => (
            <MobileTabButton
              key={item.id}
              item={item}
              active={activeTab === item.id}
              lang={lang}
              onSelect={onSelectTab}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};
