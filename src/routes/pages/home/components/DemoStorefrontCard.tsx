import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/design-system';
import { Scissors, ExternalLink } from 'lucide-react';

export interface DemoStorefrontCardProps {
  slug?: string;
  businessName?: string;
  address?: string;
}

export const DemoStorefrontCard: React.FC<DemoStorefrontCardProps> = ({
  slug = 'barbers-club',
  businessName = "Barber's Club",
  address = 'Avenida Artêmia Pires Freitas • Feira de Santana, BA',
}) => {
  return (
    <Card className="bg-surface border-border overflow-hidden shadow-xl hover:border-primary/40 transition-colors">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  {businessName}
                </h3>
                <Badge variant="success" size="sm">
                  Vitrine Ativa
                </Badge>
              </div>
              <p className="text-xs text-text-muted">
                {address}
              </p>
            </div>
          </div>

          <Link to={`/empresa/${slug}`}>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
              className="font-bold text-xs"
              data-testid="open-full-storefront-btn"
            >
              Abrir Vitrine Completa
            </Button>
          </Link>
        </div>

        {/* Destaques visuais da experiência do agendamento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-raised/70 border border-border/80 space-y-1.5">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
              1. Catálogo por Categorias
            </span>
            <h4 className="text-xs font-semibold text-text-primary">
              Cabelo, Barba e Combos
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Preço total, duração e valor exato do sinal exibidos de forma clara em cada card.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised/70 border border-border/80 space-y-1.5">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
              2. Horários Livres Reais
            </span>
            <h4 className="text-xs font-semibold text-text-primary">
              Grade por Manhã, Tarde e Noite
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Motor de disponibilidade inteligente que bloqueia conflitos de horário em tempo real.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised/70 border border-border/80 space-y-1.5">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
              3. Sinal Antecipado
            </span>
            <h4 className="text-xs font-semibold text-text-primary">
              Garantia via Pix com Hold
            </h4>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Cadeira reservada por 15 minutos para conclusão do Pix, eliminando o não-comparecimento.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DemoStorefrontCard;
