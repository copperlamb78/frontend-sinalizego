import React, { useState } from 'react';
import { AlertOctagon } from 'lucide-react';
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

        {/* COLUNA 2: SEGURANÇA & ZONA DE PERIGO LGPD */}
        <div className="space-y-6">
          <ProfilePasswordForm />

          {/* CARD ZONA DE PERIGO (LGPD) */}
          <Card className="border-red-200 bg-red-50/40 dark:border-red-900/60 dark:bg-red-950/20 shadow-xs">
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400">
                <AlertOctagon className="h-5 w-5 shrink-0" />
                <h3 className="text-base font-bold">Privacidade &amp; LGPD</h3>
              </div>

              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                Você pode solicitar a desativação da sua conta e a anonimização dos seus dados pessoais a qualquer momento, conforme assegurado pela Lei Geral de Proteção de Dados.
              </p>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-xs font-bold h-9 shadow-xs"
                  data-testid="btn-abrir-modal-excluir-conta"
                >
                  Excluir Minha Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO LGPD */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </ClientPortalLayout>
  );
};
