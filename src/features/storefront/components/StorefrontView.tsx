import React, { useState } from 'react';
import { useStorefront } from '../hooks/useStorefront';
import { StorefrontHeader } from './StorefrontHeader';
import { StorefrontCategoryTabs } from './StorefrontCategoryTabs';
import { StorefrontServiceList } from './StorefrontServiceList';
import { StorefrontSkeleton } from './StorefrontSkeleton';
import { StorefrontErrorState } from './StorefrontErrorState';
import type { StorefrontService, StorefrontCompany } from '../types/storefront.types';

interface StorefrontViewProps {
  slug: string;
  onSelectService?: (service: StorefrontService, company: StorefrontCompany) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  slug,
  onSelectService,
}) => {
  const { company, isLoading, isError, isNotFound, refetch } = useStorefront(slug);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  if (isLoading) {
    return <StorefrontSkeleton />;
  }

  if (isError || !company) {
    return (
      <StorefrontErrorState
        isNotFound={isNotFound}
        onRetry={() => refetch()}
      />
    );
  }

  const handleSelectService = (service: StorefrontService) => {
    if (onSelectService) {
      onSelectService(service, company);
    } else {
      // Caso não haja handler injetado, navega para a rota de agendamento do serviço
      console.log('Serviço selecionado para agendamento:', service.name);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-16" data-testid="storefront-view">
      {/* 1. Cabeçalho com Foto do Local e Logo */}
      <StorefrontHeader company={company} />

      {/* 2. Conteúdo Central: Catálogo de Serviços */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">
            Serviços Disponíveis
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Escolha o serviço desejado para conferir os horários livres.
          </p>
        </div>

        {/* 3. Abas de Categorias de Serviços */}
        <StorefrontCategoryTabs
          groups={company.serviceGroups || []}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
        />

        {/* 4. Lista dos Serviços */}
        <StorefrontServiceList
          groups={company.serviceGroups || []}
          selectedGroupId={selectedGroupId}
          onSelectService={handleSelectService}
        />
      </main>
    </div>
  );
};
