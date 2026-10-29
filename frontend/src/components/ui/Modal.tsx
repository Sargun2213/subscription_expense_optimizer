import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`w-full ${maxWidthStyles[maxWidth]} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-floating border border-border transition-all animate-in fade-in zoom-in-95 duration-200`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <div>
              {title && <h3 className="text-lg font-semibold text-text-main">{title}</h3>}
              {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-text-muted hover:bg-gray-100 hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
