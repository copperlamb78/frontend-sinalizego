import React, { useState } from 'react';
import {
  Calendar,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';
import { Skeleton } from '@/design-system/ui/skeleton';
import type { WorkingHourItem, ScheduleExceptionItem } from '../types';

export interface DashboardWorkingHoursViewProps {
  workingHours: WorkingHourItem[];
  exceptions: ScheduleExceptionItem[];
  isLoading: boolean;
  onSaveWorkingHours: (hours: WorkingHourItem[]) => Promise<void>;
  onCreateException: (data: {
    date: string;
    startTime?: string;
    endTime?: string;
    isOff: boolean;
    reason?: string;
  }) => Promise<void>;
  onDeleteException: (id: string) => Promise<void>;
}

const DAYS_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const DashboardWorkingHoursView: React.FC<DashboardWorkingHoursViewProps> = ({
  workingHours,
  exceptions,
  isLoading,
  onSaveWorkingHours,
  onCreateException,
  onDeleteException,
}) => {
  // Inicialização da grade semanal completa (0 a 6)
  const [localHours, setLocalHours] = useState<WorkingHourItem[]>(() => {
    const defaultList: WorkingHourItem[] = [];
    for (let day = 0; day <= 6; day++) {
      const found = workingHours.find((h) => h.dayOfWeek === day);
      if (found) {
        defaultList.push({ ...found });
      } else {
        defaultList.push({
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          lunchStartTime: '12:00',
          lunchEndTime: '13:00',
          isClosed: day === 0, // Domingo fechado por padrão
        });
      }
    }
    return defaultList;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados de Nova Exceção
  const [excDate, setExcDate] = useState('');
  const [excReason, setExcReason] = useState('');
  const [excIsOff] = useState(true);
  const [isCreatingExc, setIsCreatingExc] = useState(false);

  const handleUpdateDay = (
    dayIndex: number,
    field: keyof WorkingHourItem,
    val: unknown
  ) => {
    setLocalHours((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayIndex ? { ...item, [field]: val } : item
      )
    );
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveWorkingHours(localHours);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excDate) return;
    setIsCreatingExc(true);
    try {
      await onCreateException({
        date: excDate,
        isOff: excIsOff,
        reason: excReason.trim() || undefined,
      });
      setExcDate('');
      setExcReason('');
    } finally {
      setIsCreatingExc(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grade Semanal */}
      <Card className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight">
              Grade Semanal de Funcionamento
            </h2>
            <p className="text-xs text-text-muted">
              Defina os dias de atendimento, horários de abertura/fechamento e pausas de almoço
            </p>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" />
                Horários salvos!
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSave}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Salvar Grade
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {localHours.map((item) => {
            const dayName = DAYS_NAMES[item.dayOfWeek];

            return (
              <div
                key={item.dayOfWeek}
                className={`p-3.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                  item.isClosed
                    ? 'border-border/60 bg-surface-raised/40 opacity-70'
                    : 'border-border bg-surface'
                }`}
              >
                {/* Nome do dia e status */}
                <div className="w-40 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id={`open-${item.dayOfWeek}`}
                    checked={!item.isClosed}
                    onChange={(e) =>
                      handleUpdateDay(item.dayOfWeek, 'isClosed', !e.target.checked)
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor={`open-${item.dayOfWeek}`}
                    className="text-xs font-bold text-text-primary cursor-pointer select-none"
                  >
                    {dayName}
                  </label>
                </div>

                {/* Horários */}
                {item.isClosed ? (
                  <span className="text-xs text-text-muted italic flex items-center gap-1.5">
                    Fechado o dia inteiro
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Abertura e Fechamento */}
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted text-[11px] font-semibold">Expediente:</span>
                      <input
                        type="time"
                        value={item.startTime || '09:00'}
                        onChange={(e) =>
                          handleUpdateDay(item.dayOfWeek, 'startTime', e.target.value)
                        }
                        className="h-8 px-2 rounded-[4px] border border-border bg-surface text-text-primary text-xs"
                      />
                      <span className="text-text-muted">às</span>
                      <input
                        type="time"
                        value={item.endTime || '19:00'}
                        onChange={(e) =>
                          handleUpdateDay(item.dayOfWeek, 'endTime', e.target.value)
                        }
                        className="h-8 px-2 rounded-[4px] border border-border bg-surface text-text-primary text-xs"
                      />
                    </div>

                    {/* Almoço */}
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted text-[11px] font-semibold">Almoço:</span>
                      <input
                        type="time"
                        value={item.lunchStartTime || ''}
                        onChange={(e) =>
                          handleUpdateDay(item.dayOfWeek, 'lunchStartTime', e.target.value || null)
                        }
                        placeholder="--:--"
                        className="h-8 px-2 rounded-[4px] border border-border bg-surface text-text-primary text-xs"
                      />
                      <span className="text-text-muted">às</span>
                      <input
                        type="time"
                        value={item.lunchEndTime || ''}
                        onChange={(e) =>
                          handleUpdateDay(item.dayOfWeek, 'lunchEndTime', e.target.value || null)
                        }
                        placeholder="--:--"
                        className="h-8 px-2 rounded-[4px] border border-border bg-surface text-text-primary text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Exceções da Agenda (Feriados / Folgas) */}
      <Card className="p-5 sm:p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-text-primary tracking-tight">
            Folgas e Feriados Especiais
          </h2>
          <p className="text-xs text-text-muted">
            Cadastre dias em que o estabelecimento estará fechado ou com expediente diferenciado
          </p>
        </div>

        {/* Formulário de Nova Exceção */}
        <form
          onSubmit={handleAddException}
          className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 rounded-lg bg-surface-raised border border-border"
        >
          <div className="flex-1">
            <Input
              label="Data da Exceção"
              type="date"
              value={excDate}
              onChange={(e) => setExcDate(e.target.value)}
              required
            />
          </div>

          <div className="flex-1">
            <Input
              label="Motivo (Opcional)"
              placeholder="Ex: Feriado Nacional, Reforma..."
              value={excReason}
              onChange={(e) => setExcReason(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="md"
            isLoading={isCreatingExc}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Adicionar Folga
          </Button>
        </form>

        {/* Lista de Exceções Cadastradas */}
        {exceptions.length === 0 ? (
          <div className="py-6 text-center text-xs text-text-muted">
            Nenhuma folga ou feriado futuro cadastrado.
          </div>
        ) : (
          <div className="space-y-2">
            {exceptions.map((exc) => (
              <div
                key={exc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface text-xs"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-text-primary block">
                      {new Date(exc.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-text-muted text-[11px]">
                      {exc.reason || (exc.isOff ? 'Fechado o dia todo' : 'Horário especial')}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteException(exc.id)}
                  title="Remover folga"
                  className="text-danger hover:text-danger hover:bg-danger/10"
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
