import React from 'react';

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
        src="/assets/aistudio/final_logo_274daa1b.png"
        alt="SOVAN logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-center scale-[1.26]"
      />
    </div>
  );
};

export const KbachMotif: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="140" cy="40" r="95" stroke="#C89B3C" strokeOpacity="0.16" strokeWidth="1" />
      <circle cx="140" cy="40" r="68" stroke="#C89B3C" strokeOpacity="0.22" strokeWidth="1" />
      <path
        d="M140 -10C148 16 164 32 190 40C164 48 148 64 140 90C132 64 116 48 90 40C116 32 132 16 140 -10Z"
        stroke="#C89B3C"
        strokeOpacity="0.24"
        strokeWidth="1.25"
      />
      <path
        d="M140 12C145 25 155 35 168 40C155 45 145 55 140 68C135 55 125 45 112 40C125 35 135 25 140 12Z"
        fill="#C89B3C"
        fillOpacity="0.12"
      />
    </svg>
  );
};
