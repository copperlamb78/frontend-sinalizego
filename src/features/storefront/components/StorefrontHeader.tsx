import React from 'react';
import { MapPin, MessageCircle, Clock, Share2 } from 'lucide-react';
import { Badge } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { toast } from '@/design-system/ui/toast';
import type { StorefrontCompany } from '../types/storefront.types';

interface StorefrontHeaderProps {
  company: StorefrontCompany;
}

export const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({ company }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: company.businessName,
          text: `Agende seu horário no ${company.businessName} pelo SinalizeGO`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link do estabelecimento copiado!');
    }
  };

  const cleanPhone = company.whatsapp ? company.whatsapp.replace(/\D/g, '') : '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá! Gostaria de tirar uma dúvida sobre os serviços do ${company.businessName}.`)}`
    : undefined;

  // Localização formatada
  const locationText = [company.district, company.city].filter(Boolean).join(' • ') || 'Atendimento com horário marcado';

  return (
    <header className="relative w-full overflow-hidden border-b border-border bg-surface" data-testid="storefront-header">
      {/* 1. Banner com foto do espaço ou textura refinada */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-surface-raised">
        {company.bannerPhoto ? (
          <img
            src={company.bannerPhoto}
            alt={`Ambiente de ${company.businessName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}

        {/* Gradiente suave na base para fusão com a superfície */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/30" />

        {/* Botão de Compartilhar no topo */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={handleShare}
            aria-label="Compartilhar vitrine"
            className="bg-surface/80 backdrop-blur-sm shadow-md"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. Identidade: Logo, Nome, Endereço e Metadados */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-6 pt-0">
        <div className="relative -mt-12 sm:-mt-14 mb-4 flex items-end justify-between gap-4">
          {/* Logo do Estabelecimento */}
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-[6px] overflow-hidden border-2 border-border bg-surface shadow-md">
            {company.logoPhoto ? (
              <img
                src={company.logoPhoto}
                alt={`Logo de ${company.businessName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-surface-raised text-primary font-bold text-xl uppercase">
                {company.businessName.substring(0, 2)}
              </div>
            )}
          </div>

          {/* Atalho de Contato WhatsApp */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<MessageCircle className="h-4 w-4 text-success" />}
                className="font-medium normal-case tracking-normal shadow-sm"
              >
                Falar no WhatsApp
              </Button>
            </a>
          )}
        </div>

        {/* Título e Especialidade */}
        <div className="space-y-1 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
            {company.businessName}
          </h1>
          {company.providerType && (
            <p className="text-xs sm:text-sm text-text-secondary font-medium">
              {company.providerType}
            </p>
          )}
        </div>

        {/* Badges Sóbrios de Status e Localização */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" shape="square" dot size="sm">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Aberto hoje</span>
            </span>
          </Badge>

          <Badge variant="neutral" shape="square" size="sm">
            <span className="flex items-center gap-1 text-text-secondary">
              <MapPin className="h-3 w-3 text-text-muted" />
              <span>{locationText}</span>
            </span>
          </Badge>
        </div>
      </div>
    </header>
  );
};
