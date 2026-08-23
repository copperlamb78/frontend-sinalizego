import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarPlus,
  Phone,
  Scissors
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { downloadIcsFile } from '@/lib/calendar';
import { toast } from 'sonner';
import type { Appointment } from '@/types/appointment.types';

interface VoucherModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  if (!appointment) return null;

  const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const address = appointment.company
    ? [
        appointment.company.street,
        appointment.company.number,
        appointment.company.district,
        appointment.company.city ? `${appointment.company.city}/${appointment.company.state}` : ''
      ].filter(Boolean).join(', ')
    : 'Endereço não informado';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${appointment.company?.businessName} ${address}`
  )}`;

  const remaining = Math.max(0, (appointment.servicePrice || 0) - (appointment.downPaymentAmount || 0));

  const handleDownloadCalendar = () => {
    downloadIcsFile({
      title: `${appointment.service?.name} - ${appointment.company?.businessName}`,
      description: `Agendamento confirmado no SinalizeGO. Restante a pagar no balcão: ${formatCurrency(remaining)}.`,
      location: address,
      startDate: new Date(appointment.appointmentDate),
      durationMinutes: appointment.service?.durationMinutes || 30
    });
    toast.success('Arquivo de calendário (.ics) baixado com sucesso!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voucher Digital do Atendimento"
      description="Apresente este comprovante ao chegar no estabelecimento"
      size="md"
    >
      <div className="space-y-4">
        {/* Voucher Card Container */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-teal-500/30 space-y-4 shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">
                Comprovante de Reserva
              </span>
              <h2 className="text-base font-black text-white">
                {appointment.company?.businessName}
              </h2>
            </div>

            <Badge variant="teal" size="sm">
              #{appointment.id.slice(-6).toUpperCase()}
            </Badge>
          </div>

          {/* Service & Time Box */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Scissors className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{appointment.service?.name}</span>
              <span className="text-slate-500 font-normal">({appointment.service?.durationMinutes} min)</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="capitalize">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Horário marcado: <strong>{formattedTime}</strong></span>
            </div>

            <div className="flex items-start gap-2 text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{address}</span>
            </div>
          </div>

          {/* Financial Settlement Breakdown */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0B1120] border border-slate-800 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                Sinal Pago via Pix
              </span>
              <span className="font-bold text-teal-400">
                {formatCurrency(appointment.downPaymentAmount)}
              </span>
            </div>

            <div className="space-y-0.5 text-right">
              <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                Pagar no Balcão
              </span>
              <span className="font-black text-amber-300 text-sm">
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Maps, ICS, WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10 text-xs"
              leftIcon={<MapPin className="w-3.5 h-3.5 text-teal-400" />}
            >
              Abrir no Google Maps
            </Button>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCalendar}
            className="w-full h-10 text-xs"
            leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-teal-400" />}
          >
            Adicionar à Agenda (.ics)
          </Button>
        </div>

        {appointment.company?.whatsapp && (
          <a
            href={`https://wa.me/55${appointment.company.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="block pt-1"
          >
            <Button
              size="sm"
              className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-950/40"
              leftIcon={<Phone className="w-4 h-4" />}
            >
              Falar com o Estabelecimento no WhatsApp
            </Button>
          </a>
        )}
      </div>
    </Modal>
  );
};
