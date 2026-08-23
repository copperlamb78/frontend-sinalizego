import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Clock, CalendarOff, Save } from 'lucide-react';

export const OwnerWorkingHoursPage: React.FC = () => {
  const days = [
    { day: 'Segunda-feira', open: '09:00', close: '19:00', lunch: '12:00 - 13:00', isOpen: true },
    { day: 'Terça-feira', open: '09:00', close: '19:00', lunch: '12:00 - 13:00', isOpen: true },
    { day: 'Quarta-feira', open: '09:00', close: '19:00', lunch: '12:00 - 13:00', isOpen: true },
    { day: 'Quinta-feira', open: '09:00', close: '20:00', lunch: '12:00 - 13:00', isOpen: true },
    { day: 'Sexta-feira', open: '08:30', close: '20:30', lunch: '12:00 - 13:00', isOpen: true },
    { day: 'Sábado', open: '08:00', close: '19:00', lunch: '12:00 - 13:00', isOpen: true },
    { day: 'Domingo', open: '', close: '', lunch: '', isOpen: false }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Expediente & Horários</h1>
          <p className="text-sm text-[#94A3B8]">
            Configure os horários de abertura, fechamento e exceções de feriados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leftIcon={<CalendarOff className="w-4 h-4 text-amber-400" />}>
            Adicionar Feriado
          </Button>
          <Button size="sm" leftIcon={<Save className="w-4 h-4" />}>
            Salvar Grade
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Semanal Padrão</CardTitle>
          <CardDescription>
            Horários utilizados pelo motor de disponibilidade da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {days.map((d) => (
            <div
              key={d.day}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#1E293B] border border-slate-700/60 gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    d.isOpen ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-sm font-bold text-white w-32">{d.day}</span>
              </div>

              {d.isOpen ? (
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 bg-[#0F172A] px-3 py-1.5 rounded-lg border border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Abertura: <strong>{d.open}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0F172A] px-3 py-1.5 rounded-lg border border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Fechamento: <strong>{d.close}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>Almoço: {d.lunch}</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-red-400 font-semibold">Fechado</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
