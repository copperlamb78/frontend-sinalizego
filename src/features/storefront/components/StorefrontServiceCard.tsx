import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/design-system/ui/card';
import { Button } from '@/design-system/ui/button';
import { Badge } from '@/design-system/ui/badge';
import { formatCurrencyBRL } from '@/core/formatters/currency';
import type { StorefrontService } from '../types/storefront.types';

interface StorefrontServiceCardProps {
  service: StorefrontService;
  onSelect: (service: StorefrontService) => void;
}

export const StorefrontServiceCard: React.FC<StorefrontServiceCardProps> = ({
  service,
  onSelect,
}) => {
  const numericPrice = typeof service.totalPrice === 'string' ? parseFloat(service.totalPrice) : service.totalPrice;

  // Cálculo da exibição informativa do valor do sinal conforme regras de negócio da API
  let downPaymentPercentage = 50;
  if (numericPrice < 15) {
    downPaymentPercentage = 100;
  } else if (numericPrice >= 400 && service.downPaymentPercent) {
    downPaymentPercentage = service.downPaymentPercent;
  }

  const downPaymentValue = (numericPrice * downPaymentPercentage) / 100;

  return (
    <Card
      className="transition-all hover:border-text-secondary/40 shadow-sm"
      data-testid={`service-card-${service.id}`}
    >
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Topo do Card: Nome e Descrição */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            {service.name}
          </h3>
          {service.description && (
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {service.description}
            </p>
          )}
        </div>

        {/* Metadados: Duração, Preço Total e Sinal */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-text-muted font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{service.durationMinutes} min</span>
            </span>

            <span className="text-base font-bold text-text-primary tracking-tight">
              {formatCurrencyBRL(numericPrice)}
            </span>
          </div>

          {/* Badge sóbrio do Design System informando o sinal Pix */}
          <Badge variant="brand" shape="square" size="sm" className="font-semibold text-[11px]">
            Sinal Pix: {formatCurrencyBRL(downPaymentValue)}
          </Badge>
        </div>

        {/* Botão Oficial Primary do Design System: Fundo Teal, texto branco, font-bold uppercase */}
        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={() => onSelect(service)}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          data-testid={`select-service-btn-${service.id}`}
        >
          Escolher Horário para este Serviço
        </Button>
      </CardContent>
    </Card>
  );
};
