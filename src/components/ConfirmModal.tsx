import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsProcessing(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={() => {
        if (!isProcessing) onCancel();
      }}
    >
      <div
        className="w-full max-w-md bg-zinc-950 border-4 border-white text-white shadow-[10px_10px_0px_0px_#ffffff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-black border-b-2 border-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 ${variant === 'danger' ? 'text-red-400' : 'text-white'}`}
            />
            <h2 id="confirm-modal-title" className="text-base sm:text-lg font-heading font-black uppercase">
              {title}
            </h2>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono-numbers">
            {message}
          </p>

          <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onCancel}
              className="min-h-[44px] px-5 py-2.5 border-2 border-zinc-700 bg-black text-zinc-300 hover:border-white hover:text-white text-xs font-mono-numbers font-bold uppercase transition-colors disabled:opacity-40"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmClick}
              className={`min-h-[44px] px-6 py-2.5 border-2 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                variant === 'danger'
                  ? 'border-red-400 bg-red-600 text-white hover:bg-red-500 shadow-[4px_4px_0px_0px_#f87171]'
                  : 'border-white bg-white text-black hover:bg-zinc-200 shadow-[4px_4px_0px_0px_#ffffff]'
              }`}
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isProcessing ? 'Processing...' : confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
