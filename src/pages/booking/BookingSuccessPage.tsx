import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { appointmentsService } from '@/services/appointments.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { Modal } from '@/components/common/Modal';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  CalendarPlus,
  Navigation,
  Scissors,
  ArrowRight,
  Phone,
  Check,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { downloadIcsFile, getGoogleCalendarUrl, IcsEventOptions } from '@/lib/calendar';
import { toast } from 'sonner';
import { triggerCelebrationConfetti } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/haptics';

export const BookingSuccessPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = React.useState(false);

  // Subtle celebratory confetti & haptic on load
  React.useEffect(() => {
    triggerCelebrationConfetti();
    triggerHaptic('success');
  }, []);

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentsService.getAppointmentById(appointmentId!),
    enabled: !!appointmentId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const getCalendarEventOptions = (): IcsEventOptions | null => {
    if (!appointment) return null;

    const startDate = new Date(appointment.appointmentDate);
    const duration = appointment.service?.durationMinutes || 30;
    const companyName = appointment.company?.businessName || 'Estabelecimento';
    const serviceName = appointment.service?.name || 'Serviço';
    const address = [
      appointment.company?.street,
      appointment.company?.number,
      appointment.company?.district,
      appointment.company?.city,
      appointment.company?.state
    ]
      .filter(Boolean)
      .join(', ');

    return {
      title: `${serviceName} - ${companyName}`,
      description: `Agendamento confirmado no ${companyName}.\nServiço: ${serviceName}\nTaxa de Reserva: ${formatCurrency(
        appointment.downPaymentAmount
      )}\nAtendimento pontual com cadeira garantida.`,
      location: address || 'Endereço do Estabelecimento',
      startDate,
      durationMinutes: duration
    };
  };

  const handleOpenGoogleCalendar = () => {
    const options = getCalendarEventOptions();
    if (!options) return;

    const googleUrl = getGoogleCalendarUrl(options);
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
    setIsCalendarModalOpen(false);
    toast.success('Abrindo evento no Google Agenda...');
  };

  const handleDownloadAppleCalendar = () => {
    const options = getCalendarEventOptions();
    if (!options) return;

    downloadIcsFile(options);
    setIsCalendarModalOpen(false);
    toast.success('Arquivo aberto! Toque nele para adicionar ao Calendário do iPhone/Mac.');
  };

  const handleDownloadIcsFile = () => {
    const options = getCalendarEventOptions();
    if (!options) return;

    downloadIcsFile(options);
    setIsCalendarModalOpen(false);
    toast.success('Arquivo (.ics) baixado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const appointmentDate = appointment ? new Date(appointment.appointmentDate) : new Date();
  const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const companyName = appointment?.company?.businessName || 'Barbearia';
  const fullAddress = [
    appointment?.company?.street,
    appointment?.company?.number,
    appointment?.company?.district,
    appointment?.company?.city,
    appointment?.company?.state
  ]
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${companyName}, ${fullAddress}`
  )}`;

  const totalPrice = appointment?.servicePrice || 0;
  const downPayment = appointment?.downPaymentAmount || 0;
  const remainingPrice = Math.max(0, totalPrice - downPayment);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Success Celebration Hero */}
      <div className="text-center space-y-3 py-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/10 border-2 border-teal-400/40 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/20 animate-in zoom-in-90 duration-300">
          <CheckCircle2 className="w-10 h-10 text-teal-400" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Horário Confirmado & Cadeira Garantida</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            Agendamento Confirmado com Sucesso!
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Seu horário está garantido na agenda. Apresente este comprovante ao comparecer.
          </p>
        </div>
      </div>

      {/* Digital Voucher Card */}
      <Card className="bg-[#0F172A] border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none" />

        {/* Voucher Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              Comprovante de Reserva Garantida
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-teal-400" />
              <span>{appointment?.service?.name || 'Serviço Agendado'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {companyName} • {appointment?.service?.durationMinutes || 30} minutos
            </p>
          </div>

          <Badge variant="teal" size="sm">
            Confirmado
          </Badge>
        </div>

        {/* Date, Time & Address Grid */}
        <div className="space-y-3.5 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-teal-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Data do Atendimento</span>
              <span className="font-semibold text-white capitalize">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-teal-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Horário Reservado</span>
              <span className="font-bold text-teal-400 text-sm">{formattedTime}</span>
            </div>
          </div>

          {fullAddress && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1E293B] border border-slate-700/80 flex items-center justify-center text-teal-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Localização</span>
                <span className="font-medium text-slate-300 leading-relaxed">{fullAddress}</span>
              </div>
            </div>
          )}
        </div>

        {/* Financial Summary Breakdown */}
        <div className="p-4 rounded-2xl bg-[#1E293B]/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Valor Total do Serviço</span>
            <span className="font-semibold text-white">{formatCurrency(totalPrice)}</span>
          </div>

          <div className="flex items-center justify-between text-teal-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Taxa de Reserva Paga (Pix)</span>
            </span>
            <span className="font-bold">{formatCurrency(downPayment)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-slate-300 font-bold">
            <span>Saldo a Pagar no Estabelecimento</span>
            <span className="text-white text-sm">{formatCurrency(remainingPrice)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            variant="secondary"
            className="w-full justify-center"
            leftIcon={<CalendarPlus className="w-4 h-4 text-teal-400" />}
            onClick={() => setIsCalendarModalOpen(true)}
          >
            Adicionar à Agenda
          </Button>

          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button
              variant="outline"
              className="w-full justify-center"
              leftIcon={<Navigation className="w-4 h-4 text-teal-400" />}
            >
              Como Chegar
            </Button>
          </a>
        </div>

        {appointment?.company?.whatsapp && (
          <div className="pt-2 text-center">
            <a
              href={`https://wa.me/55${appointment.company.whatsapp.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Falar com o estabelecimento no WhatsApp</span>
            </a>
          </div>
        )}
      </Card>

      {/* Modal de Escolha da Agenda */}
      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title="Adicionar à Agenda 📅"
        description="Escolha onde deseja salvar e sincronizar o lembrete do seu atendimento:"
        size="sm"
      >
        <div className="space-y-3 pt-2">
          {/* Opção 1: Google Agenda */}
          <button
            type="button"
            onClick={handleOpenGoogleCalendar}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                    Google Agenda
                  </span>
                  <Badge variant="teal" size="sm">Recomendado</Badge>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Abre diretamente no app ou navegador
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </button>

          {/* Opção 2: Apple Agenda / iPhone */}
          <button
            type="button"
            onClick={handleDownloadAppleCalendar}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-300 shrink-0">
                <Smartphone className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors block">
                  Apple Agenda (iPhone / Mac)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Sincroniza com o app nativo do iOS / macOS
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </button>

          {/* Opção 3: Outlook / Outros (.ics) */}
          <button
            type="button"
            onClick={handleDownloadIcsFile}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all text-left group"
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

      {/* Footer Navigation */}
      <div className="text-center pt-2">
        <Link to="/meus-agendamentos">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Ver Todos os Meus Agendamentos
          </Button>
        </Link>
      </div>
    </div>
  );
};
