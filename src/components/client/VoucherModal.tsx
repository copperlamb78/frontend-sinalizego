import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarPlus,
  Phone,
  Scissors,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { downloadIcsFile, getGoogleCalendarUrl } from '@/lib/calendar';
import { companyService } from '@/services/company.service';
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
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Fallback para buscar os dados completos da empresa caso o agendamento não contenha o endereço detalhado
  const { data: fullCompany } = useQuery({
    queryKey: ['voucher-company', appointment?.company?.slug || appointment?.companyId],
    queryFn: () => companyService.getCompanyBySlug(appointment!.company!.slug),
    enabled: Boolean(appointment?.company?.slug && isOpen && !appointment.company?.street),
    staleTime: 1000 * 60 * 10
  });

  if (!appointment) return null;

  const companyData = fullCompany || appointment.company;

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

  // Montagem precisa e humanizada do endereço completo
  const addressParts = [
    companyData?.street,
    companyData?.number ? `nº ${companyData.number}` : '',
    companyData?.district,
    companyData?.city && companyData?.state ? `${companyData.city} - ${companyData.state}` : companyData?.city || companyData?.state
  ].filter(Boolean);

  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Endereço não informado';

  // Query específica para o Google Maps apontar diretamente para a localização correta
  const mapsSearchQuery = [
    companyData?.businessName,
    companyData?.street,
    companyData?.number,
    companyData?.district,
    companyData?.city,
    companyData?.state
  ]
    .filter(Boolean)
    .join(', ');

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsSearchQuery || companyData?.businessName || ''
  )}`;

  const remaining = Math.max(0, (appointment.servicePrice || 0) - (appointment.downPaymentAmount || 0));

  const calendarOptions = {
    title: `${appointment.service?.name || 'Serviço'} - ${companyData?.businessName || 'Estabelecimento'}`,
    description: `Agendamento confirmado no SinalizeGO.\nServiço: ${appointment.service?.name}\nLocal: ${fullAddress}\nRestante a pagar no balcão: ${formatCurrency(remaining)}.`,
    location: fullAddress,
    startDate: new Date(appointment.appointmentDate),
    durationMinutes: appointment.service?.durationMinutes || 30
  };

  const handleOpenGoogleCalendar = () => {
    const googleUrl = getGoogleCalendarUrl(calendarOptions);
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
    setIsCalendarModalOpen(false);
    toast.success('Abrindo evento no Google Agenda...');
  };

  const handleOpenAppleCalendar = () => {
    downloadIcsFile(calendarOptions);
    setIsCalendarModalOpen(false);
    toast.success('Adicionando ao Calendário do iPhone/Apple...');
  };

  const handleDownloadIcsFile = () => {
    downloadIcsFile(calendarOptions);
    setIsCalendarModalOpen(false);
    toast.success('Arquivo (.ics) baixado com sucesso!');
  };

  const whatsappPhone = companyData?.whatsapp || appointment.company?.whatsapp;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Voucher Digital de Atendimento"
        description="Apresente este comprovante ao chegar no estabelecimento"
        size="md"
      >
        <div className="space-y-4">
          {/* Voucher Card Container */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-teal-500/30 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  Comprovante de Reserva
                </span>
                <h2 className="text-base font-black text-white">
                  {companyData?.businessName || 'Estabelecimento'}
                </h2>
              </div>

              <Badge variant="teal" size="sm">
                Confirmado
              </Badge>
            </div>

            {/* Service & Time Box */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <Scissors className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{appointment.service?.name}</span>
                <span className="text-slate-500 font-normal">({appointment.service?.durationMinutes || 30} min)</span>
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
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{fullAddress}</span>
              </div>
            </div>

            {/* Financial Settlement Breakdown */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0B1120] border border-slate-800 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                  Taxa de Reserva Paga (Pix)
                </span>
                <span className="font-bold text-teal-400">
                  {formatCurrency(appointment.downPaymentAmount)}
                </span>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
                  Pagar no Estabelecimento
                </span>
                <span className="font-black text-amber-300 text-sm">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Maps & Calendar Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 text-xs font-semibold hover:border-teal-500/50"
                leftIcon={<MapPin className="w-3.5 h-3.5 text-teal-400" />}
              >
                Abrir no Google Maps
              </Button>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCalendarModalOpen(true)}
              className="w-full h-10 text-xs font-semibold hover:border-teal-500/50"
              leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-teal-400" />}
            >
              Adicionar à Agenda
            </Button>
          </div>

          {whatsappPhone && (
            <a
              href={`https://wa.me/55${whatsappPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
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

      {/* Modal Secundário: Seleção do Provedor de Agenda (Google Agenda / iPhone Apple Calendar) */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title="Salvar na Agenda"
        description="Escolha seu aplicativo de calendário favorito:"
        size="sm"
      >
        <div className="space-y-3 pt-2">
          {/* Opção 1: Google Agenda */}
          <button
            type="button"
            onClick={handleOpenGoogleCalendar}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all text-left group cursor-pointer gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                    Google Agenda
                  </span>
                  <Badge variant="teal" size="sm">Recomendado</Badge>
                </div>
                <span className="text-[11px] text-slate-400 block truncate">
                  Abre diretamente no app ou navegador
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors shrink-0" />
          </button>

          {/* Opção 2: Apple Agenda / iPhone */}
          <button
            type="button"
            onClick={handleOpenAppleCalendar}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all text-left group cursor-pointer gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-300 shrink-0">
                <Smartphone className="w-5 h-5 text-slate-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                    iPhone (Apple Calendar)
                  </span>
                  <Badge variant="teal" size="sm">iOS Nativo</Badge>
                </div>
                <span className="text-[11px] text-slate-400 block truncate">
                  Abre nativamente no app Calendário do iPhone/Mac
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors shrink-0" />
          </button>

          {/* Opção 3: Outlook / Outros (.ics) */}
          <button
            type="button"
            onClick={handleDownloadIcsFile}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <CalendarPlus className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors block">
                  Outlook & Outros (.ics)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Baixar arquivo universal de calendário
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </button>
        </div>
      </Modal>
    </>
  );
};
export default VoucherModal;
