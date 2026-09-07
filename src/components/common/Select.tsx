import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  count?: number;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface SelectProps<T extends string = string> {
  value?: T;
  onChange?: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export const Select = <T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  label,
  error,
  helperText,
  icon,
  leftIcon,
  className,
  triggerClassName,
  menuClassName,
  disabled = false
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (optValue: T) => {
      onChange?.(optValue);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <div ref={containerRef} className={cn('relative w-full text-left space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold text-[#94A3B8] tracking-wide uppercase">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full h-11 px-4 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer select-none',
          'bg-[#1E293B] border border-slate-700/80 text-[#F8FAFC] shadow-sm',
          'hover:border-slate-600',
          'focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20',
          isOpen && 'border-[#14B8A6] ring-2 ring-[#14B8A6]/20 bg-[#1E293B]',
          error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20 text-red-100',
          disabled && 'opacity-50 cursor-not-allowed',
          'flex items-center justify-between gap-2.5',
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {(leftIcon || selectedOption?.icon || icon) && (
            <span className="shrink-0 text-teal-400">
              {leftIcon || selectedOption?.icon || icon}
            </span>
          )}

          <span className={cn('truncate', !selectedOption && 'text-slate-500')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {typeof selectedOption?.count === 'number' && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
              {selectedOption.count}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
            isOpen && 'transform rotate-180 text-teal-400'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute left-0 right-0 top-full mt-1.5 z-50',
            'bg-[#0F172A]/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/80 p-1.5',
            'animate-in fade-in zoom-in-95 duration-150',
            menuClassName
          )}
        >
          <div className="space-y-0.5 max-h-80 overflow-y-auto custom-scrollbar p-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-all duration-150 cursor-pointer text-left',
                    isSelected
                      ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.icon && (
                      <span
                        className={cn(
                          'shrink-0',
                          isSelected ? 'text-teal-400' : 'text-slate-400'
                        )}
                      >
                        {opt.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <div className="truncate font-medium">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {typeof opt.count === 'number' && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight',
                          isSelected
                            ? 'bg-teal-500/25 text-teal-300'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                        )}
                      >
                        {opt.count}
                      </span>
                    )}

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 stroke-[2.5]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error ? (
        <p className="text-xs text-red-400 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
