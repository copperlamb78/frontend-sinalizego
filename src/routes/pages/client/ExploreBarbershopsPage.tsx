import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Store, AlertCircle } from 'lucide-react';
import { Skeleton, Button } from '@/design-system';
import {
  ClientPortalLayout,
  BarbershopCard,
  BarbershopSearchBar,
  clientService,
  type ExploreCompanyFilters,
} from '@/features/client';

export const ExploreBarbershopsPage: React.FC = () => {
  const [filters, setFilters] = useState<ExploreCompanyFilters>({});

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['explore-barbershops', filters],
    queryFn: () => clientService.exploreCompanies(filters),
    staleTime: 60_000,
  });

  const companies = data?.items || [];

  return (
    <ClientPortalLayout
      title="Barbearias Próximas"
      subtitle="Descubra estabelecimentos profissionais na sua região e agende seu horário com sinal Pix seguro."
    >
      <div className="space-y-6">
        {/* BARRA DE PESQUISA E FILTROS */}
        <BarbershopSearchBar
          onSearch={(newFilters) => setFilters(newFilters)}
          isLoading={isLoading}
        />

        {/* LISTAGEM DE BARBEARIAS */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-border rounded-xl p-4 bg-surface space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-surface border border-border rounded-xl space-y-3">
            <AlertCircle className="h-8 w-8 text-danger mx-auto" />
            <h3 className="text-base font-bold text-text-primary">
              Não foi possível carregar as barbearias
            </h3>
            <p className="text-xs text-text-muted">
              Houve um erro de comunicação com os servidores. Tente novamente.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
              Tentar Novamente
            </Button>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center bg-surface border border-border rounded-xl space-y-3" data-testid="empty-barbershops">
            <Store className="h-10 w-10 text-text-muted mx-auto" />
            <h3 className="text-base font-bold text-text-primary">
              Nenhuma barbearia encontrada
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Não encontramos nenhum estabelecimento ativo correspondente aos filtros de busca informados.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({})}
              className="text-xs font-semibold"
            >
              Limpar Filtros e Ver Todas
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted font-medium px-1">
              <span>{data?.total || companies.length} estabelecimentos disponíveis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="barbershops-grid">
              {companies.map((company) => (
                <BarbershopCard key={company.id} company={company} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
};
