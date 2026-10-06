import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/core/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  'data-testid': testId = 'ui-modal',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fecha com a tecla ESC e trava o scroll da página
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid={testId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop Sóbrio com Escurecimento Sutil */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Caixa do Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-surface border border-border rounded-lg shadow-xl text-text-primary z-10 overflow-hidden animate-in zoom-in-95 duration-150',
          sizeStyles[size],
          className
        )}
      >
        {/* Cabeçalho */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
            <div className="space-y-1 pr-6">
              {title && (
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-text-primary">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-text-muted leading-relaxed">{description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar janela"
              className="p-1 rounded-[4px] text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Corpo do Conteúdo */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
