import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-dashed border-[#0E5A3E]/18 dark:border-white/12 bg-white/85 dark:bg-[#121C16]/85 backdrop-blur-md">
      <div className="w-12 h-12 rounded-2xl bg-[#0E5A3E]/8 dark:bg-[#19875D]/15 text-[#0E5A3E] dark:text-[#5AD3A3] flex items-center justify-center mb-3.5">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#0F1F18] dark:text-[#F1F5F2] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#4A6157] dark:text-[#A3B8AE] max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
