import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidthClass="sm:max-w-md">
      <div className="space-y-5">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              tone === 'danger'
                ? 'bg-red-600/10 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                : 'bg-[#C89B3C]/15 text-[#9A7422] dark:text-[#E5C16C]'
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm leading-relaxed text-[#4A6157] dark:text-[#A3B8AE]">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#0F1F18] dark:text-[#F1F5F2] bg-[#0E5A3E]/6 dark:bg-white/8 hover:bg-[#0E5A3E]/12 dark:hover:bg-white/14 transition-colors whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors whitespace-nowrap ${
              tone === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#C89B3C] hover:bg-[#B2882E]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
