import React from 'react';
import { Store, ArrowRight, Calendar } from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Button } from '@/design-system/ui/button';
import { Link } from 'react-router-dom';

export const DashboardEmptyState: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-5 border-dashed">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
          <Store className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-text-primary tracking-tight">
            Nenhum estabelecimento vinculado
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Sua conta atual não possui uma empresa cadastrada no ecossistema SinalizeGO. Cadastre sua barbearia ou estúdio para ter acesso ao painel de gestão.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link to="/cadastro/empresa" className="block w-full">
            <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Cadastrar Meu Estabelecimento
            </Button>
          </Link>

          <Link to="/meus-agendamentos" className="block w-full">
            <Button variant="ghost" size="md" className="w-full" leftIcon={<Calendar className="h-4 w-4" />}>
              Ir para Meus Agendamentos
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
