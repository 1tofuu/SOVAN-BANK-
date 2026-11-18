import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  maxWidthClass?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  onSubmit,
  maxWidthClass = 'sm:max-w-lg',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const innerContent = (
    <>
      {/* Scrollable Body */}
      <div className={`flex-1 min-h-0 overflow-y-auto px-5 py-5 ${footer ? '' : 'pb-safe'}`}>
        {children}
      </div>

      {/* Pinned Footer */}
      {footer && (
        <div className="shrink-0 px-5 py-3.5 pb-safe border-t border-[#0E5A3E]/10 dark:border-white/10 bg-white dark:bg-[#121C16]">
          {footer}
        </div>
      )}
    </>
  );

  const modalMarkup = (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClass} bg-white dark:bg-[#121C16] border border-[#0E5A3E]/12 dark:border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#0F1F18]/15 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#0E5A3E]/10 dark:border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-[#0F1F18] dark:text-[#F1F5F2] truncate pr-4">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-[#4A6157] dark:text-[#A3B8AE] hover:bg-[#0E5A3E]/8 dark:hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#0E5A3E]"
          >
            <X size={20} />
          </button>
        </div>

        {onSubmit ? (
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {innerContent}
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {innerContent}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
};
