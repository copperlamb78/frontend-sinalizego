import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/design-system/ui/card';
import { StorefrontServiceCard } from './StorefrontServiceCard';
import type { StorefrontServiceGroup, StorefrontService } from '../types/storefront.types';

interface StorefrontServiceListProps {
  groups: StorefrontServiceGroup[];
  selectedGroupId: string | null;
  onSelectService: (service: StorefrontService) => void;
}

export const StorefrontServiceList: React.FC<StorefrontServiceListProps> = ({
  groups,
  selectedGroupId,
  onSelectService,
}) => {
  // Coletar serviços de acordo com o filtro selecionado
  const displayedServices = React.useMemo(() => {
    if (selectedGroupId) {
      const targetGroup = groups.find((g) => g.id === selectedGroupId);
      return targetGroup ? targetGroup.services : [];
    }

    // "Todos" os serviços de todos os grupos
    return groups.flatMap((group) => group.services);
  }, [groups, selectedGroupId]);

  if (displayedServices.length === 0) {
    return (
      <Card className="text-center p-8 bg-surface-raised/40">
        <p className="text-sm text-text-secondary font-medium">
          Nenhum serviço disponível nesta categoria no momento.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-testid="storefront-service-list">
      {/* Cards de Serviços */}
      <div className="space-y-3">
        {displayedServices.map((service) => (
          <StorefrontServiceCard
            key={service.id}
            service={service}
            onSelect={onSelectService}
          />
        ))}
      </div>

      {/* Card Informativo de Confiança e Clareza em 2 Passos */}
      <Card className="bg-surface-raised/60 border-border">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-[4px] bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-text-primary tracking-tight">
              Agendamento rápido em 2 passos
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              1. Escolha o serviço desejado.<br />
              2. Selecione seu horário livre e garanta sua cadeira com o sinal via Pix.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
