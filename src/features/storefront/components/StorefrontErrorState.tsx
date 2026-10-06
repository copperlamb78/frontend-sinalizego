import React from 'react';
import { Store, RefreshCw, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/design-system/ui/card';
import { Button } from '@/design-system/ui/button';

interface StorefrontErrorStateProps {
  isNotFound?: boolean;
  onRetry?: () => void;
}

export const StorefrontErrorState: React.FC<StorefrontErrorStateProps> = ({
  isNotFound = false,
  onRetry,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-6 sm:p-8 space-y-5 shadow-md">
        <CardContent className="p-0 space-y-4">
          <div className="mx-auto w-14 h-14 rounded-[6px] bg-surface-raised flex items-center justify-center text-text-secondary border border-border">
            <Store className="h-7 w-7 text-text-muted" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-text-primary">
              {isNotFound
                ? 'Estabelecimento não encontrado'
                : 'Não foi possível carregar a vitrine'}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {isNotFound
                ? 'O link que você acessou pode estar incorreto ou o estabelecimento pausou os agendamentos online.'
                : 'Tivemos uma instabilidade momentânea na conexão. Seus dados estão seguros, tente novamente.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            {onRetry && !isNotFound && (
              <Button
                variant="primary"
                size="md"
                onClick={onRetry}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Tentar Novamente
              </Button>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={() => window.history.back()}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
