import React from 'react';
import { BRAND_ASSETS } from '../../constants/app';

interface SovanLogoProps {
  size?: number;
  className?: string;
}

export const SovanLogo: React.FC<SovanLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl overflow-hidden shrink-0 bg-[#0E5A3E] shadow-xs ${className}`}
    >
      <img
        src={BRAND_ASSETS.logo}
        alt="SOVAN logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center scale-[1.26]"
      />
    </div>
  );
};
