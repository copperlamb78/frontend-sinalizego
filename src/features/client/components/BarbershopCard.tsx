import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Scissors, ArrowRight } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/design-system';
import type { ExploreCompanyItem } from '../types';

interface BarbershopCardProps {
  company: ExploreCompanyItem;
}

export const BarbershopCard: React.FC<BarbershopCardProps> = ({ company }) => {
  // Verifica se está aberto hoje baseado no dia da semana
  const todayDayOfWeek = new Date().getDay();
  const todaySchedule = company.workingHours.find((wh) => wh.dayOfWeek === todayDayOfWeek);
  const isOpenToday = todaySchedule ? !todaySchedule.isClosed : true;

  const minPriceFormatted =
    company.minPrice !== null
      ? `R$ ${company.minPrice.toFixed(2).replace('.', ',')}`
      : 'Sob consulta';

  const addressShort = `${company.district || ''}${company.district && company.city ? ', ' : ''}${company.city || ''}`;

  return (
    <Card
      className="overflow-hidden border-border bg-surface hover:border-border-strong hover:shadow-md transition-all duration-200 flex flex-col group"
      data-testid={`barbershop-card-${company.slug}`}
    >
      {/* 1. FOTO DE CAPA / BANNER REALISTA E LIMPO (SEM NEON) */}
      <div className="relative h-44 w-full bg-surface-raised overflow-hidden">
        {company.bannerPhoto || company.logoPhoto ? (
          <img
            src={company.bannerPhoto || company.logoPhoto!}
            alt={company.businessName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300 gap-2">
            <Scissors className="h-8 w-8 text-primary/80" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {company.businessName}
            </span>
          </div>
        )}

        {/* Badge Discreto de Bairro / Região Sobreposto */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/95 text-slate-900 text-xs font-bold shadow-xs">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            {company.district || 'Região Central'}
          </span>
        </div>

        {/* Status de Abertura Hoje */}
        <div className="absolute top-3 right-3">
          {isOpenToday ? (
            <Badge
              variant="success"
              size="sm"
              icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
              className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[11px] font-bold shadow-xs"
            >
              {todaySchedule?.endTime ? `Aberto até ${todaySchedule.endTime}` : 'Aberto Hoje'}
            </Badge>
          ) : (
            <Badge
              variant="neutral"
              size="sm"
              className="bg-slate-900/80 text-slate-300 border border-slate-700 text-[11px] font-semibold"
            >
              Fechado Hoje
            </Badge>
          )}
        </div>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL DO CARD */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Nome da Barbearia & Tipo */}
          <div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
              {company.businessName}
            </h3>
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <span>{company.providerType || 'Barbearia'}</span>
              {addressShort && (
                <>
                  <span>•</span>
                  <span className="line-clamp-1">{addressShort}</span>
                </>
              )}
            </p>
          </div>

          {/* Endereço Detalhado */}
          <p className="text-xs text-text-secondary line-clamp-1">
            📍 {company.street ? `${company.street}, ${company.number || 'S/N'}` : 'Endereço disponível na vitrine'}
          </p>

          {/* Serviços em Destaque (Pills Sóbrias) */}
          {company.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {company.services.slice(0, 3).map((service) => (
                <span
                  key={service.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised border border-border text-[11px] text-text-secondary font-medium"
                >
                  <Scissors className="h-2.5 w-2.5 text-primary shrink-0" />
                  {service.name} (R$ {Number(service.totalPrice).toFixed(0)})
                </span>
              ))}
              {company.services.length > 3 && (
                <span className="text-[11px] text-text-muted self-center">
                  +{company.services.length - 3} mais
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. RODAPÉ DO CARD: PREÇO A PARTIR DE & BOTÃO DIRETO */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-medium text-text-muted block">
              Cortes a partir de
            </span>
            <span className="text-base font-extrabold text-text-primary">
              {minPriceFormatted}
            </span>
          </div>

          <Link to={`/empresa/${company.slug}`}>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5 shrink-0" />}
              className="text-xs font-bold h-9 px-3.5 shadow-xs"
              data-testid={`btn-agendar-${company.slug}`}
            >
              Agendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
