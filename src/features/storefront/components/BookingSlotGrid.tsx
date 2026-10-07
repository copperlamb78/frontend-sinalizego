import React from 'react';
import { Sun, Sunset, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/design-system/ui/card';
import { Skeleton } from '@/design-system/ui/skeleton';
import { cn } from '@/core/utils/cn';

interface BookingSlotGridProps {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  isLoading?: boolean;
}

export const BookingSlotGrid: React.FC<BookingSlotGridProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}) => {
  // Divisão em Manhã (< 12:00) e Tarde (>= 12:00)
  const morningSlots = React.useMemo(() => {
    return slots.filter((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      return hour < 12;
    });
  }, [slots]);

  const afternoonSlots = React.useMemo(() => {
    return slots.filter((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      return hour >= 12;
    });
  }, [slots]);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2" data-testid="slots-loading-skeleton">
        <Skeleton className="h-4 w-44" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <Card className="bg-surface-raised/40 border-dashed border-border text-center p-6 sm:p-8" data-testid="empty-slots-warning">
        <CardContent className="p-0 space-y-2 flex flex-col items-center">
          <div className="p-2 rounded-full bg-surface-raised text-text-muted">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h5 className="text-sm font-bold text-text-primary">
            Nenhum horário livre nesta data
          </h5>
          <p className="text-xs text-text-secondary max-w-sm">
            Todos os horários deste dia foram reservados ou a barbearia não terá expediente. Por favor, escolha outro dia no carrossel acima.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderSlotButton = (slot: string) => {
    const isSelected = selectedSlot === slot;

    return (
      <button
        key={slot}
        type="button"
        onClick={() => onSelectSlot(slot)}
        data-testid={`time-slot-${slot}`}
        className={cn(
          'h-10 rounded-[4px] border font-bold text-xs sm:text-sm tracking-tight transition-all flex items-center justify-center cursor-pointer select-none',
          isSelected
            ? 'bg-primary text-white border-primary'
            : 'bg-surface text-text-primary border-border hover:border-text-secondary/50 hover:bg-surface-raised/60'
        )}
      >
        {slot}
      </button>
    );
  };

  return (
    <section className="space-y-5" data-testid="booking-slot-grid">
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-text-primary tracking-tight">
          2. Escolha o horário de atendimento
        </h4>
        <p className="text-xs text-text-muted font-normal">
          Selecione o melhor horário para reservar sua cadeira
        </p>
      </div>

      {/* Turno Manhã */}
      {morningSlots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
            <Sun className="h-3.5 w-3.5 text-warning" />
            <span>Turno Manhã</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {morningSlots.map(renderSlotButton)}
          </div>
        </div>
      )}

      {/* Turno Tarde */}
      {afternoonSlots.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">
            <Sunset className="h-3.5 w-3.5 text-accent" />
            <span>Turno Tarde / Noite</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {afternoonSlots.map(renderSlotButton)}
          </div>
        </div>
      )}
    </section>
  );
};
