import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: string; // Formato YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  className?: string;
  required?: boolean;
  name?: string;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Selecione uma data',
  error,
  disabled = false,
  minDate,
  maxDate,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date
  const parsedValue = useMemo(() => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  // Initial view month and year
  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedValue ? parsedValue.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedValue ? parsedValue.getMonth() : new Date().getMonth();
  });

  // Sync view when value changes externally
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.getFullYear());
      setViewMonth(parsedValue.getMonth());
    }
  }, [parsedValue]);

  // Close popover when clicking outside
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

  // Year range options (from 1930 to Current Year + 5)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const start = 1930;
    const end = currentYear + 5;
    const list: number[] = [];
    for (let y = end; y >= start; y--) {
      list.push(y);
    }
    return list;
  }, []);

  // Previous month
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  // Next month
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Select day
  const handleSelectDay = (day: number) => {
    const yStr = String(viewYear).padStart(4, '0');
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    onChange?.(dateStr);
    setIsOpen(false);
  };

  // Clear date
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  // Set today
  const handleSelectToday = () => {
    const today = new Date();
    const yStr = String(today.getFullYear()).padStart(4, '0');
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange?.(dateStr);
    setIsOpen(false);
  };

  // Calendar matrix computation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Format date display (DD/MM/AAAA)
  const displayFormatted = useMemo(() => {
    if (!parsedValue) return '';
    const d = String(parsedValue.getDate()).padStart(2, '0');
    const m = String(parsedValue.getMonth() + 1).padStart(2, '0');
    const y = parsedValue.getFullYear();
    return `${d}/${m}/${y}`;
  }, [parsedValue]);

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day: number) => {
    if (!parsedValue) return false;
    return (
      parsedValue.getFullYear() === viewYear &&
      parsedValue.getMonth() === viewMonth &&
      parsedValue.getDate() === day
    );
  };

  const isDisabledDay = (day: number) => {
    const yStr = String(viewYear).padStart(4, '0');
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;

    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  return (
    <div ref={containerRef} className={cn('relative w-full space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150',
          'bg-[#1E293B] border border-slate-700 text-slate-200',
          'hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-800/50',
          error && 'border-rose-500/80 focus:ring-rose-500',
          isOpen && 'ring-2 ring-teal-500/60 border-teal-500'
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-teal-400 shrink-0" />
          <span className={cn(!displayFormatted && 'text-slate-500 font-normal')}>
            {displayFormatted || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {displayFormatted && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
              title="Limpar data"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </button>

      {error && (
        <p className="text-[11px] text-rose-400 font-medium pt-0.5 animate-fadeIn">
          {error}
        </p>
      )}

      {/* Shadcn Calendar Popover Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 top-full mt-2 z-50 w-72 sm:w-80 p-4 rounded-2xl shadow-2xl',
            'bg-[#0F172A] border border-slate-700/80 text-white backdrop-blur-xl',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {/* Header: Month & Year Controls */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
            {/* Quick Month Selector */}
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="bg-[#1E293B] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>

            {/* Quick Year Selector */}
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="bg-[#1E293B] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((wd) => (
              <span key={wd} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8 w-8" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const currentToday = isToday(day);
              const dayDisabled = isDisabledDay(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={dayDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer',
                    'hover:bg-slate-800 text-slate-200',
                    selected && 'bg-[#14B8A6] text-white font-bold shadow-md shadow-teal-500/30 hover:bg-teal-600',
                    currentToday && !selected && 'border border-teal-500/60 text-teal-300 font-bold',
                    dayDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent text-slate-600'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer"
            >
              Selecionar Hoje
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
