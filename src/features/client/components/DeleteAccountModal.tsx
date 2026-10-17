import React, { useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { Modal, Button, toast } from '@/design-system';
import { useAuth } from '@/features/auth';
import { clientService } from '../services/clientService';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isConfirmed = confirmationText.trim().toUpperCase() === 'EXCLUIR';

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      await clientService.deleteMyAccount();
      toast.success('Conta Desativada', {
        description: 'Sua conta foi desativada e seus dados foram desassociados conforme a LGPD.',
      });
      await logout();
      window.location.href = '/';
    } catch (error: any) {
      toast.error('Erro ao Desativar', {
        description: error?.response?.data?.message || 'Falha ao desativar sua conta.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" data-testid="delete-account-modal">
      <div className="flex flex-col max-h-[85vh] text-text-primary">
        {/* 1. CABEÇALHO FIXO */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-border flex items-start justify-between bg-surface">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 shrink-0">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                Excluir Minha Conta (LGPD)
              </h3>
              <p className="text-xs text-text-muted">
                Ação irreversível de desativação e desassociação de dados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. CORPO ROLÁVEL */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800/60 text-red-900 dark:text-red-300 space-y-2">
            <p className="font-semibold leading-relaxed">
              Atenção: Ao confirmar a exclusão da sua conta:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-red-800 dark:text-red-300">
              <li>Seu acesso à plataforma SinalizeGO será cancelado imediatamente.</li>
              <li>Agendamentos futuros ativos serão cancelados.</li>
              <li>Seus dados pessoais serão anonimizados conforme a Lei Geral de Proteção de Dados (LGPD).</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary block">
              Para confirmar, digite <strong className="text-red-600">EXCLUIR</strong> no campo abaixo:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Digite EXCLUIR"
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary outline-none focus:border-red-500"
              data-testid="input-confirm-delete"
            />
          </div>
        </div>

        {/* 3. RODAPÉ FIXO */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-border bg-surface-raised flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold h-9"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={!isConfirmed}
            isLoading={isSubmitting}
            onClick={handleDelete}
            className="text-xs font-bold h-9 shadow-xs"
            data-testid="btn-confirm-delete-account"
          >
            Excluir Definitivamente
          </Button>
        </div>
      </div>
    </Modal>
  );
};
