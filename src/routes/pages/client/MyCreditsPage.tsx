import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, AlertCircle } from 'lucide-react';
import { Skeleton, Button } from '@/design-system';
import {
  ClientPortalLayout,
  CreditSummaryCard,
  CreditCompanyCard,
  CreditHistoryTable,
  clientService,
} from '@/features/client';

export const MyCreditsPage: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['client-credits'],
    queryFn: () => clientService.getMyCredits(),
    staleTime: 60_000,
  });

  const totalAvailable = data?.totalAvailable || 0;
  const availableByCompany = data?.availableByCompany || [];
  const allCredits = data?.allCredits || [];

  return (
    <ClientPortalLayout
      title="Meus Créditos"
      subtitle="Acompanhe os créditos gerados por cancelamentos e utilize-os como abatimento automático no sinal de novos agendamentos."
      creditTotal={totalAvailable}
    >
      <div className="space-y-6">
        {/* BANNER DE SALDO TOTAL */}
        {isLoading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : (
          <CreditSummaryCard totalAvailable={totalAvailable} />
        )}

        {/* CRÉDITOS ATIVOS POR ESTABELECIMENTO */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-text-primary">
              Créditos por Barbearia
            </h3>
            <span className="text-xs text-text-muted">
              {availableByCompany.length} estabelecimento(s) com saldo
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-surface border border-border rounded-xl space-y-3">
              <AlertCircle className="h-8 w-8 text-danger mx-auto" />
              <h3 className="text-base font-bold text-text-primary">
                Erro ao carregar créditos
              </h3>
              <p className="text-xs text-text-muted">
                Não foi possível consultar seu saldo de créditos no momento.
              </p>
              <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
                Tentar Novamente
              </Button>
            </div>
          ) : availableByCompany.length === 0 ? (
            <div
              className="p-8 text-center bg-surface border border-border rounded-xl space-y-2"
              data-testid="empty-credits-by-company"
            >
              <Wallet className="h-8 w-8 text-text-muted mx-auto" />
              <h4 className="text-sm font-bold text-text-primary">
                Você não possui créditos ativos no momento
              </h4>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Quando você cancela uma reserva com antecedência entre 2h e 24h (Regra N6 CDC), o sinal pago é convertido em crédito válido por 90 dias nesta tela.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              data-testid="credits-by-company-grid"
            >
              {availableByCompany.map((group) => (
                <CreditCompanyCard key={group.companyId} creditGroup={group} />
              ))}
            </div>
          )}
        </div>

        {/* HISTÓRICO DE TRANSAÇÕES DE CRÉDITO */}
        <div className="pt-2">
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : (
            <CreditHistoryTable credits={allCredits} />
          )}
        </div>
      </div>
    </ClientPortalLayout>
  );
};
