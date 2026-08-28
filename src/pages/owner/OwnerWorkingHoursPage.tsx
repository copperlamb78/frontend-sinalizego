import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workingHoursService } from '@/services/working-hours.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Clock,
  CalendarOff,
  Save,
  Plus,
  Trash2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WorkingHour } from '@/types/company.types';

const DAY_NAMES: Record<number, string> = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  0: 'Domingo'
};

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00'
];

export const OwnerWorkingHoursPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState<WorkingHour[]>([]);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);

  // Exception form state
  const [excDate, setExcDate] = useState('');
  const [excDescription, setExcDescription] = useState('');
  const excIsClosed = true;

  // 1. Fetch Working Hours
  const { data: workingHoursData, isLoading: isLoadingHours } = useQuery({
    queryKey: ['owner-working-hours'],
    queryFn: () => workingHoursService.getWorkingHours()
  });

  // 2. Fetch Exceptions
  const { data: exceptions, isLoading: isLoadingExceptions } = useQuery({
    queryKey: ['owner-working-exceptions'],
    queryFn: () => workingHoursService.getExceptions()
  });

  // Populate local schedule state
  useEffect(() => {
    if (workingHoursData && workingHoursData.length > 0) {
      // Sort Monday (1) to Sunday (0)
      const sorted = [...workingHoursData].sort((a, b) => {
        const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
        const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
        return orderA - orderB;
      });
      setSchedule(sorted);
    }
  }, [workingHoursData]);

  // 3. Save Schedule Mutation
  const saveScheduleMutation = useMutation({
    mutationFn: (hours: WorkingHour[]) => workingHoursService.updateWorkingHours(hours),
    onSuccess: () => {
      toast.success('Grade semanal de funcionamento salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['owner-working-hours'] });
      queryClient.invalidateQueries({ queryKey: ['company-by-slug'] });
    },
    onError: () => toast.error('Não foi possível salvar a grade de horários.')
  });

  // 4. Exception Mutations
  const createExceptionMutation = useMutation({
    mutationFn: () =>
      workingHoursService.createException({
        date: excDate,
        description: excDescription,
        isClosed: excIsClosed
      }),
    onSuccess: () => {
      toast.success('Feriado/exceção adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['owner-working-exceptions'] });
      setIsExceptionModalOpen(false);
      setExcDate('');
      setExcDescription('');
    },
    onError: () => toast.error('Não foi possível adicionar o feriado.')
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: (id: string) => workingHoursService.deleteException(id),
    onSuccess: () => {
      toast.success('Feriado/exceção removido.');
      queryClient.invalidateQueries({ queryKey: ['owner-working-exceptions'] });
    }
  });

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek
          ? { ...item, isClosed: !item.isClosed }
          : item
      )
    );
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime' | 'lunchStartTime' | 'lunchEndTime',
    value: string | null
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, [field]: value } : item
      )
    );
  };

  if (isLoadingHours || isLoadingExceptions) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-400" />
            <span>Expediente & Horários de Funcionamento</span>
          </h1>
          <p className="text-xs text-slate-400">
            Defina os dias de atendimento, horário de abertura/fechamento e pausas para almoço.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExceptionModalOpen(true)}
            leftIcon={<CalendarOff className="w-4 h-4 text-amber-400" />}
          >
            Adicionar Feriado / Folga
          </Button>

          <Button
            size="sm"
            isLoading={saveScheduleMutation.isPending}
            onClick={() => saveScheduleMutation.mutate(schedule)}
            className="shadow-lg shadow-teal-500/20"
            leftIcon={<Save className="w-4 h-4 text-white" />}
          >
            Salvar Grade
          </Button>
        </div>
      </div>

      {/* Weekly Schedule Table Card */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Grade Semanal Padrão</span>
          </h2>
          <span className="text-xs text-slate-500">Horário de Brasília</span>
        </div>

        <div className="space-y-3">
          {schedule.map((item) => {
            const dayName = DAY_NAMES[item.dayOfWeek] || `Dia ${item.dayOfWeek}`;
            const isOpen = !item.isClosed;
            const hasLunch = !!item.lunchStartTime && !!item.lunchEndTime;

            return (
              <div
                key={item.dayOfWeek}
                className={cn(
                  'p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4',
                  isOpen
                    ? 'bg-[#0B1120] border-slate-800'
                    : 'bg-slate-900/30 border-slate-800/40 opacity-70'
                )}
              >
                {/* Left: Day & Toggle */}
                <div className="flex items-center gap-3 w-48 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(item.dayOfWeek)}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
                      isOpen ? 'bg-teal-500' : 'bg-slate-800'
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                        isOpen ? 'left-6' : 'left-1'
                      )}
                    />
                  </button>

                  <div>
                    <span className="text-sm font-bold text-white block">{dayName}</span>
                    <Badge variant={isOpen ? 'teal' : 'destructive'} size="sm">
                      {isOpen ? 'Aberto' : 'Fechado'}
                    </Badge>
                  </div>
                </div>

                {/* Right: Time Selectors */}
                {isOpen ? (
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Working Hours */}
                    <div className="flex items-center gap-1.5 bg-[#1E293B] px-3 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 font-semibold">Expediente:</span>
                      <select
                        value={item.startTime || '09:00'}
                        onChange={(e) =>
                          handleTimeChange(item.dayOfWeek, 'startTime', e.target.value)
                        }
                        className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t} className="bg-slate-900 text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                      <span className="text-slate-500 font-bold">às</span>
                      <select
                        value={item.endTime || '19:00'}
                        onChange={(e) =>
                          handleTimeChange(item.dayOfWeek, 'endTime', e.target.value)
                        }
                        className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t} value={t} className="bg-slate-900 text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Lunch Break Option */}
                    <div className="flex items-center gap-1.5 bg-[#1E293B] px-3 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 font-semibold">Almoço:</span>
                      {hasLunch ? (
                        <>
                          <select
                            value={item.lunchStartTime || '12:00'}
                            onChange={(e) =>
                              handleTimeChange(item.dayOfWeek, 'lunchStartTime', e.target.value)
                            }
                            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t} className="bg-slate-900 text-white">
                                {t}
                              </option>
                            ))}
                          </select>
                          <span className="text-slate-500 font-bold">às</span>
                          <select
                            value={item.lunchEndTime || '13:00'}
                            onChange={(e) =>
                              handleTimeChange(item.dayOfWeek, 'lunchEndTime', e.target.value)
                            }
                            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                          >
                            {TIME_OPTIONS.map((t) => (
                              <option key={t} value={t} className="bg-slate-900 text-white">
                                {t}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              handleTimeChange(item.dayOfWeek, 'lunchStartTime', null);
                              handleTimeChange(item.dayOfWeek, 'lunchEndTime', null);
                            }}
                            className="ml-1 text-[11px] text-slate-500 hover:text-red-400"
                            title="Remover almoço"
                            aria-label="Remover almoço"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleTimeChange(item.dayOfWeek, 'lunchStartTime', '12:00');
                            handleTimeChange(item.dayOfWeek, 'lunchEndTime', '13:00');
                          }}
                          className="text-[11px] text-teal-400 font-semibold hover:underline cursor-pointer"
                        >
                          + Adicionar Pausa
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    Agenda fechada para agendamentos neste dia.
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Holidays & Special Exceptions Card */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-amber-400" />
              <span>Feriados & Folgas Especiais Cadastradas</span>
            </h2>
            <p className="text-xs text-slate-400">
              Datas em que o estabelecimento estará fechado ou com horário diferenciado.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExceptionModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Adicionar Data
          </Button>
        </div>

        {exceptions && exceptions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exceptions.map((exc) => {
              const formattedDate = new Date(`${exc.date}T00:00:00`).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div
                  key={exc.id}
                  className="p-3.5 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white">{formattedDate}</span>
                    </div>
                    {exc.description && (
                      <p className="text-[11px] text-slate-400">{exc.description}</p>
                    )}
                    <Badge variant="destructive" size="sm">Fechado o dia todo</Badge>
                  </div>

                  <button
                    onClick={() => deleteExceptionMutation.mutate(exc.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Excluir Feriado"
                    aria-label="Excluir Feriado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#0B1120] border border-slate-800 rounded-2xl text-xs text-slate-500 space-y-1">
            <p>Nenhum feriado ou folga especial cadastrada.</p>
          </div>
        )}
      </Card>

      {/* Modal: Add Holiday Exception */}
      <Modal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        title="Adicionar Feriado ou Folga Especial"
        description="Bloqueie a agenda para datas comemorativas ou manutenções"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!excDate) {
              toast.error('Selecione a data da folga.');
              return;
            }
            createExceptionMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Data da Folga"
            type="date"
            value={excDate}
            onChange={(e) => setExcDate(e.target.value)}
            required
          />

          <Input
            label="Descrição / Motivo (Opcional)"
            placeholder="Ex: Feriado de Tiradentes, Manutenção no Salão"
            value={excDescription}
            onChange={(e) => setExcDescription(e.target.value)}
          />

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExceptionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createExceptionMutation.isPending}
            >
              Adicionar Data
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
