import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, Button, Badge } from '@/design-system';

interface PaymentExpiredCardProps {
  onChooseNewSlot: () => void;
}

export const PaymentExpiredCard: React.FC<PaymentExpiredCardProps> = ({
  onChooseNewSlot,
}) => {
  return (
    <Card className="max-w-md mx-auto shadow-md border-border" data-testid="payment-expired-card">
      <CardHeader className="text-center pb-3 border-b border-border bg-amber-500/5">
        <div className="flex items-center justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Badge variant="warning" size="sm" dot className="whitespace-nowrap">
            Reserva Expirada
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">
          Tempo de Reserva Esgotado
        </h2>
        <p className="text-xs text-text-secondary">
          O prazo de 15 minutos para pagamento do Pix terminou.
        </p>
      </CardHeader>

      <CardContent className="p-5 space-y-3 text-center">
        <p className="text-xs text-text-secondary leading-relaxed">
          Para garantir a rotatividade e evitar cadeiras vazias na barbearia, a vaga temporária foi liberada para outros clientes.
        </p>
        <p className="text-xs text-text-muted">
          Caso o Pix já tenha sido descontado da sua conta nos últimos segundos, nosso sistema atualizará seu agendamento automaticamente assim que recebermos a confirmação do Banco Central.
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-border/60 bg-surface-raised/20">
        <Button
          variant="primary"
          size="md"
          onClick={onChooseNewSlot}
          leftIcon={<RotateCcw className="h-4 w-4" />}
          className="w-full text-xs font-bold tracking-wider"
          data-testid="choose-new-slot-btn"
        >
          Escolher Outro Horário
        </Button>
      </CardFooter>
    </Card>
  );
};
