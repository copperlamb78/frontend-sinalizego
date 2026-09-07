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
  Calendar,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Copy,
  ClipboardPaste,
  CopyCheck,
  X
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

export const DEFAULT_WEEKLY_SCHEDULE: WorkingHour[] = [
  { dayOfWeek: 1, isClosed: false, startTime: '09:00', endTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { dayOfWeek: 2, isClosed: false, startTime: '09:00', endTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { dayOfWeek: 3, isClosed: false, startTime: '09:00', endTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { dayOfWeek: 4, isClosed: false, startTime: '09:00', endTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { dayOfWeek: 5, isClosed: false, startTime: '09:00', endTime: '19:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { dayOfWeek: 6, isClosed: false, startTime: '09:00', endTime: '18:00', lunchStartTime: '12:00', lunchEndTime: '13:00' },
  { dayOfWeek: 0, isClosed: true, startTime: '09:00', endTime: '18:00', lunchStartTime: null, lunchEndTime: null }
];

export const OwnerWorkingHoursPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState<WorkingHour[]>([]);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estado para copiar e colar horários entre dias
  const [copiedSchedule, setCopiedSchedule] = useState<{
    sourceDayOfWeek: number;
    sourceDayName: string;
    startTime: string;
    endTime: string;
    lunchStartTime: string | null;
    lunchEndTime: string | null;
  } | null>(null);

  // Exception form state
  const [excDate, setExcDate] = useState('');
  const [excDescription, setExcDescription] = useState('');

  // 1. Fetch Working Hours
  const { data: workingHoursData, isLoading: isLoadingHours } = useQuery({
    queryKey: ['owner-working-hours'],
    queryFn: () => workingHoursService.getWorkingHours(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // 2. Fetch Exceptions
  const { data: exceptions, isLoading: isLoadingExceptions } = useQuery({
    queryKey: ['owner-working-exceptions'],
    queryFn: () => workingHoursService.getExceptions(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Populate local schedule state and ensure all 7 days exist
  useEffect(() => {
    if (workingHoursData && workingHoursData.length > 0) {
      // Map existing days and merge with missing days from default schedule
      const map = new Map<number, WorkingHour>();
      DEFAULT_WEEKLY_SCHEDULE.forEach((d) => map.set(d.dayOfWeek, { ...d }));
      workingHoursData.forEach((d) => map.set(d.dayOfWeek, { ...d }));

      const sorted = Array.from(map.values()).sort((a, b) => {
        const orderA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
        const orderB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
        return orderA - orderB;
      });
      setSchedule(sorted);
      setHasUnsavedChanges(false);
    } else if (workingHoursData && workingHoursData.length === 0) {
      // If backend has no working hours configured yet, pre-populate all 7 days
      setSchedule(DEFAULT_WEEKLY_SCHEDULE);
      setHasUnsavedChanges(true);
    }
  }, [workingHoursData]);

  // 3. Save Schedule Mutation
  const saveScheduleMutation = useMutation({
    mutationFn: async () => {
      return workingHoursService.updateWorkingHours(schedule);
    },
    onSuccess: () => {
      toast.success('Grade semanal de horários atualizada com sucesso!');
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['owner-working-hours'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      queryClient.invalidateQueries({ queryKey: ['company-checkout'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Não foi possível salvar a grade semanal.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  // 4. Create Exception Mutation
  const createExceptionMutation = useMutation({
    mutationFn: () =>
      workingHoursService.createException({
        date: excDate,
        isClosed: true,
        description: excDescription
      }),
    onSuccess: () => {
      toast.success('Folga especial / feriado cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['owner-working-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      setIsExceptionModalOpen(false);
      setExcDate('');
      setExcDescription('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Não foi possível cadastrar a folga.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  // 5. Delete Exception Mutation
  const deleteExceptionMutation = useMutation({
    mutationFn: (id: string) => workingHoursService.deleteException(id),
    onSuccess: () => {
      toast.success('Feriado / folga removida.');
      queryClient.invalidateQueries({ queryKey: ['owner-working-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
    onError: () => toast.error('Não foi possível remover a folga.')
  });

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek === dayOfWeek) {
          return { ...item, isClosed: !item.isClosed };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime' | 'lunchStartTime' | 'lunchEndTime',
    value: string | null
  ) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek === dayOfWeek) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
  };

    const handleCopyDay = (item: WorkingHour) => {
    const dayName = DAY_NAMES[item.dayOfWeek] || 'Dia selecionado';
    setCopiedSchedule({
      sourceDayOfWeek: item.dayOfWeek,
      sourceDayName: dayName,
      startTime: item.startTime || '09:00',
      endTime: item.endTime || '19:00',
      lunchStartTime: item.lunchStartTime ?? null,
      lunchEndTime: item.lunchEndTime ?? null
    });
    toast.info(`Horário de ${dayName} copiado! Clique em "Colar" em outro dia ou "Colar para Todos".`);
  };

  const handlePasteToDay = (targetDayOfWeek: number) => {
    if (!copiedSchedule) return;
    const targetName = DAY_NAMES[targetDayOfWeek] || 'Dia';
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek === targetDayOfWeek) {
          return {
            ...item,
            isClosed: false,
            startTime: copiedSchedule.startTime,
            endTime: copiedSchedule.endTime,
            lunchStartTime: copiedSchedule.lunchStartTime,
            lunchEndTime: copiedSchedule.lunchEndTime
          };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
    toast.success(`Horário de ${copiedSchedule.sourceDayName} colado em ${targetName}!`);
  };

  const handlePasteToAllDays = () => {
    if (!copiedSchedule) return;
    setSchedule((prev) =>
      prev.map((item) => ({
        ...item,
        isClosed: false,
        startTime: copiedSchedule.startTime,
        endTime: copiedSchedule.endTime,
        lunchStartTime: copiedSchedule.lunchStartTime,
        lunchEndTime: copiedSchedule.lunchEndTime
      }))
    );
    setHasUnsavedChanges(true);
    toast.success(`Horário de ${copiedSchedule.sourceDayName} aplicado para todos os dias da semana!`);
  };

  const handlePasteToWeekdays = () => {
    if (!copiedSchedule) return;
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek >= 1 && item.dayOfWeek <= 5) {
          return {
            ...item,
            isClosed: false,
            startTime: copiedSchedule.startTime,
            endTime: copiedSchedule.endTime,
            lunchStartTime: copiedSchedule.lunchStartTime,
            lunchEndTime: copiedSchedule.lunchEndTime
          };
        }
        return item;
      })
    );
    setHasUnsavedChanges(true);
    toast.success(`Horário de ${copiedSchedule.sourceDayName} aplicado de Segunda a Sexta!`);
  };

  const handleReplicateDayToAll = (item: WorkingHour) => {
    const dayName = DAY_NAMES[item.dayOfWeek] || 'Dia';
    const sTime = item.startTime || '09:00';
    const eTime = item.endTime || '19:00';
    const lStart = item.lunchStartTime;
    const lEnd = item.lunchEndTime;

    setCopiedSchedule({
      sourceDayOfWeek: item.dayOfWeek,
      sourceDayName: dayName,
      startTime: sTime,
      endTime: eTime,
      lunchStartTime: lStart ?? null,
      lunchEndTime: lEnd ?? null
    });

    setSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        isClosed: false,
        startTime: sTime,
        endTime: eTime,
        lunchStartTime: lStart ?? null,
        lunchEndTime: lEnd ?? null
      }))
    );
    setHasUnsavedChanges(true);
    toast.success(`Horário de ${dayName} copiado e aplicado para todos os dias da semana!`);
  };

  const handleResetToDefaultSchedule = () => {
    setSchedule(DEFAULT_WEEKLY_SCHEDULE);
    setHasUnsavedChanges(true);
    toast.info('Horário comercial padrão aplicado! Clique em "Salvar Grade de Horários" para confirmar.');
  };

  if (isLoadingHours || isLoadingExceptions) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Expediente & Horários de Funcionamento
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure os horários de abertura, fechamento e pausas de almoço em que seu estabelecimento atende.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDefaultSchedule}
            className="cursor-pointer"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-teal-400" />}
          >
            Padrão Comercial
          </Button>

          <Button
            type="button"
            size="sm"
            isLoading={saveScheduleMutation.isPending}
            onClick={() => saveScheduleMutation.mutate()}
            className={cn(
              'font-bold cursor-pointer transition-all',
              hasUnsavedChanges ? 'shadow-lg shadow-teal-500/25 ring-2 ring-teal-400/50' : ''
            )}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Salvar Grade de Horários
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Você possui alterações na grade semanal não salvas. Clique em <strong>Salvar Grade de Horários</strong> para aplicar.</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="h-8 text-xs font-bold shrink-0"
            isLoading={saveScheduleMutation.isPending}
            onClick={() => saveScheduleMutation.mutate()}
          >
            Salvar Agora
          </Button>
        </div>
      )}

      {/* Weekly Schedule Card */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Grade Semanal Padrão (Segunda a Domingo)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ative os dias em que há expediente e defina os intervalos de atendimento dos profissionais.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetToDefaultSchedule}
              className="text-xs text-slate-300"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-teal-400" />}
            >
              Aplicar Seg a Sáb (09h às 19h)
            </Button>
          </div>
        </div>

                {/* Active Copied Schedule Banner */}
        {copiedSchedule && (
          <div className="bg-gradient-to-r from-teal-950/70 via-slate-900 to-slate-900 border border-teal-500/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl shrink-0 border border-teal-500/30">
                <Copy className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    Horário copiado de: <span className="text-teal-400 font-black">{copiedSchedule.sourceDayName}</span>
                  </span>
                  <Badge variant="teal" size="sm" className="text-[10px]">
                    Pronto para colar
                  </Badge>
                </div>
                <p className="text-slate-300 text-xs">
                  Expediente: <strong className="text-white">{copiedSchedule.startTime} às {copiedSchedule.endTime}</strong>
                  {copiedSchedule.lunchStartTime && copiedSchedule.lunchEndTime ? (
                    <span> • Almoço: <strong className="text-white">{copiedSchedule.lunchStartTime} às {copiedSchedule.lunchEndTime}</strong></span>
                  ) : (
                    <span> • Sem intervalo de almoço</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handlePasteToAllDays}
                className="text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold cursor-pointer h-9 shadow-md shadow-teal-500/20"
                leftIcon={<CopyCheck className="w-3.5 h-3.5" />}
              >
                Colar para Todos os Dias
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePasteToWeekdays}
                className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer h-9"
              >
                Colar Seg a Sex
              </Button>

              <button
                type="button"
                onClick={() => setCopiedSchedule(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                title="Limpar seleção de cópia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Days List */}
        {schedule.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {schedule.map((item) => {
              const hasLunch = Boolean(item.lunchStartTime && item.lunchEndTime);

              return (
                <div
                  key={item.dayOfWeek}
                  className={cn(
                    'py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors',
                    item.isClosed ? 'opacity-50' : 'opacity-100'
                  )}
                >
                  {/* Day Info & Open/Close Toggle */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(item.dayOfWeek)}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none select-none',
                        !item.isClosed ? 'bg-teal-500' : 'bg-slate-700'
                      )}
                      title={!item.isClosed ? 'Dia Aberto' : 'Dia Fechado'}
                    >
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full bg-white block absolute top-1 transition-transform',
                          !item.isClosed ? 'left-7' : 'left-1'
                        )}
                      />
                    </button>

                    <div>
                      <span className="text-sm font-bold text-white block">
                        {DAY_NAMES[item.dayOfWeek]}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {!item.isClosed ? 'Expediente Aberto' : 'Fechado'}
                      </span>
                    </div>
                  </div>

                  {/* Time Pickers & Lunch */}
                  {!item.isClosed ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {/* Work Hours */}
                      <div className="flex items-center gap-1.5 bg-[#1E293B] px-3 py-1.5 rounded-xl border border-slate-700">
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
                              className="ml-1 text-[11px] text-slate-500 hover:text-red-400 cursor-pointer font-bold px-1"
                              title="Remover pausa de almoço"
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

                  {/* Actions: Copiar / Colar / Colar para Todos */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center pt-2 md:pt-0">
                    {/* Botão Copiar */}
                    <button
                      type="button"
                      onClick={() => handleCopyDay(item)}
                      title={`Copiar horários de ${DAY_NAMES[item.dayOfWeek]}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar</span>
                    </button>

                    {/* Botão Colar (habilitado se houver cópia) */}
                    {copiedSchedule && (
                      <button
                        type="button"
                        onClick={() => handlePasteToDay(item.dayOfWeek)}
                        title={`Colar horário de ${copiedSchedule.sourceDayName} em ${DAY_NAMES[item.dayOfWeek]}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/50 hover:border-teal-400 transition-all cursor-pointer shadow-sm active:scale-95 animate-in fade-in"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-teal-400" />
                        <span>Colar</span>
                      </button>
                    )}

                    {/* Botão Colar p/ Todos direto deste dia */}
                    <button
                      type="button"
                      onClick={() => handleReplicateDayToAll(item)}
                      title={`Replicar horários de ${DAY_NAMES[item.dayOfWeek]} para todos os dias da semana`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-teal-950/40 text-slate-300 hover:text-teal-300 border border-slate-700/80 hover:border-teal-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <CopyCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>Colar p/ Todos</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0B1120] border border-slate-800 rounded-2xl space-y-3">
            <Clock className="w-8 h-8 text-teal-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Nenhum dia configurado</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Inicialize a grade semanal padrão com horários de atendimento de Segunda a Sábado.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleResetToDefaultSchedule}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Inicializar Grade Semanal (Seg a Sáb)
            </Button>
          </div>
        )}
      </Card>

      {/* Holidays & Special Exceptions Card */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-4 shadow-xl">
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
