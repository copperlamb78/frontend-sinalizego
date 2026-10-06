import React from 'react';
import { cn } from '@/core/utils/cn';
import type { StorefrontWorkingHour } from '../types/storefront.types';

export interface DateItem {
  dateString: string; // YYYY-MM-DD
  dayLabel: string; // "HOJE", "AMANHÃ", "SEG", "TER"...
  dayNumber: number; // 24, 25, 26...
  dayOfWeek: number; // 0..6
  isClosed: boolean;
}

interface BookingDateCarouselProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateString: string) => void;
  workingHours: StorefrontWorkingHour[];
}

export const BookingDateCarousel: React.FC<BookingDateCarouselProps> = ({
  selectedDate,
  onSelectDate,
  workingHours,
}) => {
  // Gera os próximos 14 dias com metadados
  const dates: DateItem[] = React.useMemo(() => {
    const list: DateItem[] = [];
    const today = new Date();
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const dayOfWeek = d.getDay();
      let dayLabel = dayNames[dayOfWeek];
      if (i === 0) dayLabel = 'HOJE';
      if (i === 1) dayLabel = 'AMANHÃ';

      // Verificar se a empresa abre neste dia da semana
      const schedule = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
      const isClosed = schedule ? schedule.isClosed : dayOfWeek === 0; // padrão: fecha aos domingos se não configurado

      list.push({
        dateString,
        dayLabel,
        dayNumber: d.getDate(),
        dayOfWeek,
        isClosed,
      });
    }

    return list;
  }, [workingHours]);

  return (
    <section className="space-y-2.5" data-testid="booking-date-carousel">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-text-primary tracking-tight">
          1. Escolha o dia do atendimento
        </h4>
        <span className="text-[11px] text-text-muted font-medium">
          Próximos 14 dias disponíveis
        </span>
      </div>

      {/* Carrossel de rolagem horizontal tátil */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
        {dates.map((item) => {
          const isSelected = selectedDate === item.dateString;
          const isDisabled = item.isClosed;

          return (
            <button
              key={item.dateString}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(item.dateString)}
              data-testid={`date-chip-${item.dateString}`}
              className={cn(
                'flex flex-col items-center justify-between min-w-[76px] h-[68px] p-2 rounded-[6px] border transition-all text-center select-none cursor-pointer',
                isSelected
                  ? 'bg-surface border-primary ring-2 ring-primary/40 shadow-sm'
                  : 'bg-surface border-border hover:border-text-secondary/40',
                isDisabled && 'opacity-40 cursor-not-allowed bg-surface-raised/40 border-dashed'
              )}
            >
              {/* Rótulo superior do dia */}
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider',
                  isSelected ? 'text-primary' : 'text-text-muted',
                  isDisabled && 'text-text-muted'
                )}
              >
                {item.dayLabel}
              </span>

              {/* Número do dia */}
              <span
                className={cn(
                  'text-base font-extrabold leading-none',
                  isSelected ? 'text-text-primary' : 'text-text-secondary',
                  isDisabled && 'text-text-muted'
                )}
              >
                {item.dayNumber}
              </span>

              {/* Status de vagas do dia */}
              <span
                className={cn(
                  'text-[9px] font-semibold tracking-tight',
                  isDisabled
                    ? 'text-danger'
                    : isSelected
                    ? 'text-primary font-bold'
                    : 'text-success'
                )}
              >
                {isDisabled ? 'Fechado' : isSelected ? 'Selecionado' : 'Horários livres'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
