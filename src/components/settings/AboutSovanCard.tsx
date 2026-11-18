import React from 'react';
import { SovanLogo } from '../common/SovanLogo';

export const AboutSovanCard: React.FC = () => {
  return (
    <section className="rounded-2xl bg-white/88 dark:bg-[#121C16]/88 backdrop-blur-md border border-[#0E5A3E]/12 dark:border-white/10 p-6">
      <div className="flex items-start gap-4">
        <SovanLogo size={46} className="shrink-0" />
        <div className="space-y-3 min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#0F1F18] dark:text-[#F1F5F2]">
            About SOVAN · សុវណ្ណ
          </h2>

          <p className="text-sm leading-relaxed text-[#4A6157] dark:text-[#A3B8AE]">
            SOVAN (សុវណ្ណ, meaning Gold) is a personal finance application inspired by Cambodian
            heritage and modern financial technology.
          </p>

          <p className="text-sm leading-relaxed text-[#4A6157] dark:text-[#A3B8AE]">
            Designed with simplicity, elegance, and financial clarity in mind, SOVAN helps you
            manage your money, track expenses, and build better financial habits.
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
  );
};
