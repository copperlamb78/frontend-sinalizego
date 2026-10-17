import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/design-system';
import type { CompanyCreditGroup } from '../types';

interface CreditCompanyCardProps {
  creditGroup: CompanyCreditGroup;
}

export const CreditCompanyCard: React.FC<CreditCompanyCardProps> = ({ creditGroup }) => {
  // Encontra a data de expiração mais próxima
  const expirationDates = creditGroup.items.map((i) => new Date(i.expiresAt).getTime());
  const earliestExpTime = expirationDates.length > 0 ? Math.min(...expirationDates) : null;

  let daysRemaining = 90;
  if (earliestExpTime) {
    const diffDays = Math.ceil((earliestExpTime - Date.now()) / (1000 * 60 * 60 * 24));
    daysRemaining = Math.max(0, diffDays);
  }

  const formattedAmount = `R$ ${creditGroup.totalAmount.toFixed(2).replace('.', ',')}`;

  return (
    <Card
      className="border-border bg-surface hover:border-border-strong hover:shadow-xs transition-all duration-200"
      data-testid={`credit-card-${creditGroup.companyId}`}
    >
      <CardContent className="p-5 space-y-4">
        {/* CABEÇALHO COM LOGO E STATUS */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-raised border border-border text-primary font-bold text-sm shrink-0">
              {creditGroup.logoPhoto ? (
                <img
                  src={creditGroup.logoPhoto}
                  alt={creditGroup.businessName}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                creditGroup.businessName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-bold text-text-primary line-clamp-1">
                {creditGroup.businessName}
              </h4>
              <span className="text-xs text-text-muted">Crédito Exclusivo</span>
            </div>
          </div>

          <Badge
            variant="success"
            size="sm"
            className="font-bold text-[11px] whitespace-nowrap shrink-0"
          >
            Disponível
          </Badge>
        </div>

        <div className="h-px w-full bg-border/60" />

        {/* VALOR E CONTAGEM REGRESSIVA */}
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              Saldo para Abatimento
            </span>
            <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {formattedAmount}
            </div>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{daysRemaining} dias restantes</span>
            </p>
          </div>

          <Link to={`/empresa/${creditGroup.slug}`}>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5 shrink-0" />}
              className="text-xs font-bold h-9 shadow-xs"
              data-testid={`btn-usar-credito-${creditGroup.slug}`}
            >
              Agendar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
