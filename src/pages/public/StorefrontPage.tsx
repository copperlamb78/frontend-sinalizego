import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import {
  MapPin,
  Clock,
  Phone,
  Scissors,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Store,
  ShieldCheck,
  Flame,
  TrendingUp,
  Share2,
  Check
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const StorefrontPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showSchedule, setShowSchedule] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (!company) return;
    const shareUrl = window.location.href;
    const shareTitle = company.businessName;
    const shareText = `Agende seu horário na ${company.businessName} pelo SinalizeGO!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link da barbearia copiado com sucesso!');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.info(`Compartilhe este link: ${shareUrl}`);
    }
  };

  const {
    data: company,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['storefront', slug],
    queryFn: () => companyService.getCompanyBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  // Filter services by search term
  // ⚡ Bolt: Added early return to prevent unnecessary deep copies when search is empty,
  // and cached searchTerm.toLowerCase() outside the nested loops to reduce string operations.
  const filteredGroups = useMemo(() => {
    if (!company?.serviceGroups) return [];
    if (!searchTerm) return company.serviceGroups;

    const query = searchTerm.toLowerCase();

    return company.serviceGroups.map((group) => ({
      ...group,
      services: group.services?.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query))
      )
    })).filter((group) => group.services && group.services.length > 0);
  }, [company?.serviceGroups, searchTerm]);

  // Working hours calculation in real-time
  const todayIndex = new Date().getDay();

  const openStatus = useMemo(() => {
    if (!company?.workingHours || company.workingHours.length === 0) {
      return {
        isOpen: false,
        statusText: 'Fechado',
        infoText: '',
      };
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayHours = company.workingHours.find((wh) => wh.dayOfWeek === currentDay);

    const parseMinutes = (timeStr?: string | null) => {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(':').map(Number);
      return isNaN(h) || isNaN(m) ? null : h * 60 + m;
    };

    const getNextOpenInfo = (fromDayIndex: number) => {
      const SHORT_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      for (let offset = 1; offset <= 7; offset++) {
        const nextIndex = (fromDayIndex + offset) % 7;
        const nextWh = company.workingHours?.find((wh) => wh.dayOfWeek === nextIndex);
        if (nextWh && !nextWh.isClosed && nextWh.startTime) {
          if (offset === 1) {
            return `Abre amanhã às ${nextWh.startTime}`;
          }
          return `Abre ${SHORT_DAYS[nextIndex]} às ${nextWh.startTime}`;
        }
      }
      return null;
    };

    if (todayHours && !todayHours.isClosed && todayHours.startTime && todayHours.endTime) {
      const startMinutes = parseMinutes(todayHours.startTime);
      const endMinutes = parseMinutes(todayHours.endTime);
      const lunchStart = parseMinutes(todayHours.lunchStartTime);
      const lunchEnd = parseMinutes(todayHours.lunchEndTime);

      if (startMinutes !== null && endMinutes !== null) {
        // Antes de abrir hoje
        if (currentMinutes < startMinutes) {
          return {
            isOpen: false,
            statusText: 'Fechado',
            infoText: `Abre às ${todayHours.startTime}`,
          };
        }

        // Intervalo de almoço
        if (lunchStart !== null && lunchEnd !== null && currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
          return {
            isOpen: false,
            statusText: 'Fechado',
            infoText: `Abre às ${todayHours.lunchEndTime}`,
          };
        }

        // Aberto no momento
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          return {
            isOpen: true,
            statusText: 'Aberto agora',
            infoText: `Fecha às ${todayHours.endTime}`,
          };
        }

        // Já encerrou hoje
        const nextOpen = getNextOpenInfo(currentDay);
        return {
          isOpen: false,
          statusText: 'Fechado',
          infoText: nextOpen || '',
        };
      }
    }

    // Hoje está fechado o dia todo
    const nextOpen = getNextOpenInfo(currentDay);
    return {
      isOpen: false,
      statusText: 'Fechado',
      infoText: nextOpen || '',
    };
  }, [company?.workingHours]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Estabelecimento Não Encontrado</h2>
        <p className="text-xs text-slate-400">
          O link informado pode estar incorreto ou o estabelecimento desativou temporariamente sua página pública.
        </p>
        <Link to="/" className="inline-block pt-2">
          <Button variant="outline" size="sm">
            Voltar para a Página Inicial
          </Button>
        </Link>
      </div>
    );
  }

  const fullAddress = [company.street, company.number, company.district, company.city, company.state]
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${company.businessName}, ${fullAddress}`
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Hero / Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-800 shadow-2xl">
        {company.bannerPhoto ? (
          <div className="h-44 sm:h-60 w-full overflow-hidden relative">
            <img
              src={company.bannerPhoto}
              alt={company.businessName}
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-teal-900/30 via-slate-900 to-teal-950/40 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
          </div>
        )}

        {/* Business Info Header */}
        <div className="p-6 sm:p-8 relative -mt-12 sm:-mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            {/* Logo Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1E293B] border-2 border-teal-500/40 shadow-xl overflow-hidden shrink-0 flex items-center justify-center">
              {company.logoPhoto ? (
                <img
                  src={company.logoPhoto}
                  alt={company.businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#14B8A6] to-[#0F766E] text-white">
                  <Scissors className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#F8FAFC] tracking-tight">
                  {company.businessName}
                </h1>
                <Badge variant="teal" size="sm">
                  {company.providerType || 'Barbearia'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#94A3B8] flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  {company.city}, {company.state}
                </span>

                <span className="text-slate-600 hidden sm:inline">•</span>

                <button
                  type="button"
                  onClick={() => setShowSchedule((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 hover:opacity-85 transition-opacity cursor-pointer group select-none text-left"
                  title="Clique para ver os horários da semana"
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      openStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    )}
                  />
                  <span
                    className={cn(
                      'font-semibold',
                      openStatus.isOpen ? 'text-emerald-400' : 'text-rose-400'
                    )}
                  >
                    {openStatus.statusText}
                  </span>
                  {openStatus.infoText && (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300 font-normal">
                        {openStatus.infoText}
                      </span>
                    </>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-200',
                      showSchedule && 'rotate-180'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {company.whatsapp && (
              <a
                href={`https://wa.me/55${company.whatsapp.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <Button variant="secondary" size="sm" className="w-full" leftIcon={<Phone className="w-3.5 h-3.5 text-emerald-400" />}>
                  WhatsApp
                </Button>
              </a>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex-1 sm:flex-none text-slate-200 border-slate-700 hover:border-teal-500/50 hover:bg-slate-800 transition-colors"
              leftIcon={
                isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-teal-400" />
                )
              }
            >
              {isCopied ? 'Copiado!' : 'Compartilhar'}
            </Button>

            <a
              href={googleMapsUrl}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button variant="outline" size="sm" className="w-full" rightIcon={<ExternalLink className="w-3 h-3" />}>
                Como Chegar
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Working Hours Drawer / Bar */}
      <div className="rounded-2xl bg-[#0F172A] border border-slate-800 p-4 transition-all">
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Horários de Funcionamento da Semana</span>
          </div>
          <div className="flex items-center gap-1 text-teal-400">
            <span>{showSchedule ? 'Ocultar' : 'Ver Todos'}</span>
            {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showSchedule && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-4 mt-3 border-t border-slate-800/80 text-xs">
            {DAYS_OF_WEEK.map((dayName, idx) => {
              const wh = company.workingHours?.find((item) => item.dayOfWeek === idx);
              const isToday = idx === todayIndex;
              return (
                <div
                  key={dayName}
                  className={cn(
                    'p-2.5 rounded-xl border flex items-center justify-between',
                    isToday
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 font-semibold'
                      : 'bg-[#1E293B]/50 border-slate-800 text-slate-400'
                  )}
                >
                  <span>{dayName}</span>
                  <span>
                    {wh && !wh.isClosed
                      ? `${wh.startTime} - ${wh.endTime}`
                      : 'Fechado'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Services Catalogue */}
      <div className="space-y-6">
        {/* Scarcity & High Demand Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="w-4 h-4" />
            </span>
            <span className="font-semibold">
              Alta procura para horários de pico e fim de semana. Reserve sua cadeira com antecedência para garantir vaga!
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 shrink-0">
            <TrendingUp className="w-3 h-3" />
            Horários Disputados
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>Serviços Disponíveis para Agendamento</span>
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Selecione o serviço desejado para escolher data, horário e garantir sua cadeira sem espera
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Groups and Services Grid */}
        {filteredGroups && filteredGroups.length > 0 ? (
          <div className="space-y-8">
            {filteredGroups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400">
                    {group.name}
                  </h3>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.services?.map((service, sIndex) => {
                    const minSignal = Math.max(15, (service.totalPrice * service.downPaymentPercent) / 100);
                    const isPopular = sIndex === 0;
                    return (
                      <Card
                        key={service.id}
                        hoverEffect
                        className="flex flex-col justify-between p-5 bg-[#0F172A] border-slate-800/90 relative overflow-hidden"
                      >
                        {isPopular && (
                          <div className="absolute top-0 right-0">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border-l border-b border-teal-500/30 px-2.5 py-1 rounded-bl-xl">
                              <Sparkles className="w-3 h-3 text-teal-400" />
                              Mais Procurado
                            </span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3 pr-24">
                            <h4 className="text-base font-bold text-[#F8FAFC]">
                              {service.name}
                            </h4>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-teal-400 shrink-0">
                              {formatCurrency(service.totalPrice)}
                            </span>
                          </div>

                          {service.description && (
                            <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                              {service.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              {service.durationMinutes} min
                            </span>
                            <span className="text-[11px] text-teal-400 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-teal-400" />
                              Reserva Garantida a partir de {formatCurrency(minSignal)}
                            </span>
                          </div>

                          <Link to={`/reserva/${company.id}/${service.id}`} state={{ service, company }}>
                            <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                              Agendar
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2">
            <p className="text-xs text-slate-400">
              Nenhum serviço encontrado para o termo pesquisado.
            </p>
          </div>
        )}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
          <span>
            Atendimento pontual com Cadeira Garantida. Sem perda de tempo em filas. Estorno integral para cancelamentos com mais de 24h de antecedência.
          </span>
        </div>
      </div>
    </div>
  );
};
