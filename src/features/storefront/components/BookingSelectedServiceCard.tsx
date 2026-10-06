import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/design-system/ui/card';
import { Badge } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { formatCurrencyBRL } from '@/core/formatters/currency';
import type { StorefrontService } from '../types/storefront.types';

interface BookingSelectedServiceCardProps {
  service: StorefrontService;
  onEditService: () => void;
}

export const BookingSelectedServiceCard: React.FC<BookingSelectedServiceCardProps> = ({
  service,
  onEditService,
}) => {
  const numericPrice = typeof service.totalPrice === 'string' ? parseFloat(service.totalPrice) : service.totalPrice;

  // Cálculo informativo do sinal de reserva
  let downPaymentPercentage = 50;
  if (numericPrice < 15) {
    downPaymentPercentage = 100;
  } else if (numericPrice >= 400 && service.downPaymentPercent) {
    downPaymentPercentage = service.downPaymentPercent;
  }

  const downPaymentValue = (numericPrice * downPaymentPercentage) / 100;

  return (
    <Card className="bg-surface border-border shadow-sm" data-testid="selected-service-card">
      <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Serviço Selecionado
          </span>
          <h3 className="text-base font-bold text-text-primary truncate">
            {service.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-text-muted" />
              <span>{service.durationMinutes} min</span>
            </span>
            <span>•</span>
            <span>Total: {formatCurrencyBRL(numericPrice)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="brand" shape="square" size="sm" className="font-semibold text-[11px]">
            Sinal: {formatCurrencyBRL(downPaymentValue)}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={onEditService}
            className="text-xs text-primary hover:text-primary-hover p-0 h-auto font-semibold"
            data-testid="change-service-btn"
          >
            Alterar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
