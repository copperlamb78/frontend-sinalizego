import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export const OwnerCalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Agenda Operacional</h1>
          <p className="text-sm text-[#94A3B8]">
            Grade diária e semanal com controle atômico de conclusão de atendimento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Anterior
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
            Próximo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade de Horários</CardTitle>
          <CardDescription>Visualização dos agendamentos confirmados e bloqueios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { time: '09:00 - 09:45', client: 'Carlos Alberto', service: 'Corte Tradicional', status: 'COMPLETED' },
              { time: '10:00 - 10:45', client: 'Marcos Vinicius', service: 'Barboterapia', status: 'COMPLETED' },
              { time: '14:00 - 14:45', client: 'Rodrigo Silva', service: 'Corte Degrade', status: 'CONFIRMED' },
              { time: '15:30 - 16:15', client: 'Lucas Mendes', service: 'Barba & Cabelo', status: 'CONFIRMED' },
              { time: '17:00 - 17:45', client: 'Henrique Prado', service: 'Corte Navalhado', status: 'PENDING_PAYMENT' }
            ].map((slot) => (
              <div
                key={slot.time}
                className="p-4 rounded-xl bg-[#1E293B] border border-slate-700/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {slot.time}
                  </span>
                  <Badge
                    variant={
                      slot.status === 'CONFIRMED'
                        ? 'teal'
                        : slot.status === 'COMPLETED'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {slot.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{slot.client}</h4>
                  <p className="text-xs text-slate-400">{slot.service}</p>
                </div>

                {slot.status === 'CONFIRMED' && (
                  <Button size="sm" className="w-full h-8 text-xs" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Concluir Atendimento
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
