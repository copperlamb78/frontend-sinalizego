import React, { useState } from 'react';
import { Card, CardContent, Button } from '@/design-system';
import {
  ClientPortalLayout,
  ProfilePersonalForm,
  ProfileCpfCard,
  ProfilePasswordForm,
  DeleteAccountModal,
} from '@/features/client';

export const MyProfilePage: React.FC = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <ClientPortalLayout
      title="Meu Perfil &amp; Segurança"
      subtitle="Gerencie seus dados de contato, documento CPF para pagamentos Pix e credenciais de acesso."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUNA 1: DADOS PESSOAIS & DOCUMENTO */}
        <div className="space-y-6">
          <ProfilePersonalForm />
          <ProfileCpfCard />
        </div>

        {/* COLUNA 2: SEGURANÇA & EXCLUSÃO */}
        <div className="space-y-6">
          <ProfilePasswordForm />

          {/* EXCLUSÃO DE CONTA */}
          <Card className="border-border bg-surface shadow-xs">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Exclusão de Conta
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Ação definitiva para encerramento de acesso e desativação da sua conta.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-xs font-semibold text-text-muted hover:text-danger hover:border-danger/30 hover:bg-danger/5 shrink-0"
                data-testid="btn-abrir-modal-excluir-conta"
              >
                Excluir Minha Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </ClientPortalLayout>
  );
};
