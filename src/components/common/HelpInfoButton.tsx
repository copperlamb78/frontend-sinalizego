import React, { useState } from 'react';
import { CircleHelp, Check } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

export interface HelpInfoButtonProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  buttonAriaLabel?: string;
}

export const HelpInfoButton: React.FC<HelpInfoButtonProps> = ({
  title,
  subtitle,
  icon,
  content,
  className,
  buttonAriaLabel = 'Mais informações'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={buttonAriaLabel}
        className={`inline-flex items-center justify-center p-1.5 -m-1 text-slate-400 hover:text-amber-400 active:scale-95 transition-all rounded-lg hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-amber-500/30 touch-manipulation cursor-pointer ${className || ''}`}
      >
        <CircleHelp className="w-4 h-4 transition-transform hover:scale-110" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="sm"
        title={
          <div className="flex items-center gap-2.5 text-left">
            {icon && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                {icon}
              </div>
            )}
            <div>
              <span className="text-base sm:text-lg font-bold text-white block">
                {title}
              </span>
              {subtitle && (
                <span className="text-xs text-slate-400 font-normal block">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        }
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Entendi, fechar
          </Button>
        }
      >
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 pt-1">
          {content}
        </div>
      </Modal>
    </>
  );
};
