import React, { useState } from 'react';
import { Card, CardContent, Input, Button, toast } from '@/design-system';
import { clientService } from '../services/clientService';

export const ProfilePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Campo Obrigatório', { description: 'Informe sua senha atual.' });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Senha Curta', {
        description: 'A nova senha deve possuir pelo menos 8 caracteres.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Senhas Diferentes', {
        description: 'A confirmação de senha não confere.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await clientService.changePassword({ currentPassword, newPassword });
      toast.success('Senha Alterada', {
        description: 'Sua senha de acesso foi atualizada com sucesso.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Erro ao Alterar Senha', {
        description: error?.response?.data?.message || 'Senha atual incorreta.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-surface shadow-xs" data-testid="profile-password-card">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary">
            Segurança &amp; Senha
          </h3>
          <p className="text-xs text-text-muted">
            Atualize sua senha de login informando sua senha atual para confirmação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Senha Atual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
            data-testid="input-current-password"
          />

          <Input
            type="password"
            label="Nova Senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo de 8 caracteres"
            required
            data-testid="input-new-password"
          />

          <Input
            type="password"
            label="Confirmar Nova Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            required
            data-testid="input-confirm-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSubmitting}
              className="font-bold text-xs h-9 px-5 shadow-xs"
              data-testid="btn-alterar-senha"
            >
              Atualizar Senha
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
