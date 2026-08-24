import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { appointmentsService } from '@/services/appointments.service';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { CancelAppointmentModal } from '@/components/client/CancelAppointmentModal';
import { VoucherModal } from '@/components/client/VoucherModal';
import {
  Calendar,
  Clock,
  MapPin,
  Receipt,
  XCircle,
  QrCode,
  Store,
  Scissors
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Appointment } from '@/types/appointment.types';

export const ClientAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [voucherAppointment, setVoucherAppointment] = useState<Appointment | null>(null);

  // 1. Fetch User Appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['user-appointments-list'],
    queryFn: () => appointmentsService.getUserAppointments()
  });

  const filteredAppointments = (appointments || []).filter((apt) => {
    if (activeTab === 'UPCOMING') {
      return apt.status === 'CONFIRMED' || apt.status === 'PENDING_PAYMENT';
    }
    return apt.status === 'COMPLETED' || apt.status === 'CANCELED';
  });

  const upcomingCount = (appointments || []).filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING_PAYMENT'
  ).length;
  const historyCount = (appointments || []).filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CANCELED'
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-400" />
          <span>Meus Agendamentos</span>
        </h1>
        <p className="text-xs text-slate-400">
          Acompanhe seus horários marcados, comprovantes digitais e histórico completo.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer select-none',
            activeTab === 'UPCOMING'
              ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <span>Próximos Agendamentos</span>
          {upcomingCount > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                activeTab === 'UPCOMING' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-300'
              )}
            >
              {upcomingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer select-none',
            activeTab === 'HISTORY'
              ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          )}
        >
          <span>Histórico e Concluídos</span>
          {historyCount > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                activeTab === 'HISTORY' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-300'
              )}
            >
              {historyCount}
            </span>
          )}
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const formattedDate = new Date(apt.appointmentDate).toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            });
            const formattedTime = new Date(apt.appointmentDate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            });

            const companyAddress = apt.company
              ? [
                  apt.company.street,
                  apt.company.number,
                  apt.company.district,
                  apt.company.city ? `${apt.company.city}/${apt.company.state}` : ''
                ]
                  .filter(Boolean)
                  .join(', ')
              : 'Endereço não informado';

            const remaining = Math.max(
              0,
              (apt.servicePrice || 0) - (apt.downPaymentAmount || 0)
            );

            return (
              <Card
                key={apt.id}
                hoverEffect
                className="p-5 bg-[#0F172A] border-slate-800 space-y-4 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Info Details */}
                  <div className="space-y-3">
                    {/* Top Status & Code */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {apt.status === 'CONFIRMED' && (
                        <Badge variant="teal" dot>
                          CONFIRMADO
                        </Badge>
                      )}
                      {apt.status === 'PENDING_PAYMENT' && (
                        <Badge variant="warning" dot>
                          AGUARDANDO PIX
                        </Badge>
                      )}
                      {apt.status === 'COMPLETED' && (
                        <Badge variant="neutral">
                          CONCLUÍDO
                        </Badge>
                      )}
                      {apt.status === 'CANCELED' && (
                        <Badge variant="destructive">
                          CANCELADO
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500 font-mono">
                        #{apt.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {/* Establishment & Service */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-teal-400 shrink-0" />
                        <h2 className="text-sm font-bold text-white">
                          {apt.company?.businessName || 'Estabelecimento'}
                        </h2>
                      </div>
                      <h3 className="text-base font-black text-teal-300 mt-0.5 flex items-center gap-1.5">
                        <Scissors className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>{apt.service?.name || 'Serviço'}</span>
                      </h3>
                    </div>

                    {/* Schedule & Address Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="capitalize">{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>
                          {formattedTime} ({apt.service?.durationMinutes || 30} min)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-xs">{companyAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Financial Breakdown & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800 shrink-0">
                    {/* Financial Values */}
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-1 text-xs text-left md:text-right">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">
                          Taxa de Reserva (Pix)
                        </span>
                        <span className="font-bold text-teal-400">
                          {formatCurrency(apt.downPaymentAmount)}
                        </span>
                      </div>

                      {apt.status === 'CONFIRMED' && (
                        <div>
                          <span className="text-[10px] text-amber-400 font-bold block uppercase">
                            Pagar no Estabelecimento
                          </span>
                          <span className="font-black text-amber-300 text-sm">
                            {formatCurrency(remaining)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {apt.status === 'PENDING_PAYMENT' && (
                        <Link to={`/pagamento/pix/${apt.id}`} className="w-full sm:w-auto">
                          <Button
                            size="sm"
                            className="w-full sm:w-auto text-xs h-9 font-bold shadow-md shadow-teal-500/20"
                            leftIcon={<QrCode className="w-3.5 h-3.5" />}
                          >
                            Pagar Pix
                          </Button>
                        </Link>
                      )}

                      {apt.status === 'CONFIRMED' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs h-9 font-bold cursor-pointer"
                            onClick={() => setVoucherAppointment(apt)}
                            leftIcon={<Receipt className="w-3.5 h-3.5 text-teal-400" />}
                          >
                            Voucher e Rota
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                            onClick={() => setAppointmentToCancel(apt)}
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}

                      {apt.status === 'COMPLETED' && (
                        <Link to={`/empresa/${apt.company?.slug || 'vintage-club'}`}>
                          <Button variant="outline" size="sm" className="text-xs h-9">
                            Agendar Novamente
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum agendamento encontrado</h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'UPCOMING'
                ? 'Você não possui atendimentos futuros confirmados.'
                : 'Seu histórico de atendimentos concluídos está vazio.'}
            </p>
            {activeTab === 'UPCOMING' && (
              <Link to="/explorar">
                <Button size="sm" className="mt-2">
                  Explorar Barbearias
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Modal: Transparent Cancellation */}
      <CancelAppointmentModal
        appointment={appointmentToCancel}
        isOpen={!!appointmentToCancel}
        onClose={() => setAppointmentToCancel(null)}
      />

      {/* Modal: Digital Voucher & Directions */}
      <VoucherModal
        appointment={voucherAppointment}
        isOpen={!!voucherAppointment}
        onClose={() => setVoucherAppointment(null)}
      />
    </div>
  );
};
