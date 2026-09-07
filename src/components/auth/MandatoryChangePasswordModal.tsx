import React, { useState } from 'react';
import { Lock, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';
import { authService } from '@/services/auth.service';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export const MandatoryChangePasswordModal: React.FC = () => {
  const { user, setUser, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If user is not logged in or doesn't have mustChangePassword, do not render
  if (!user || !user.mustChangePassword) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da nova senha não confere.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword
      });

      // Update user state in memory and localStorage
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem('@sinalizego:user', JSON.stringify(updatedUser));
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Não foi possível alterar a senha. Verifique se a senha atual (temporária) está correta.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Erro ao alterar a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}} // Bloqueante — não fecha até trocar
      title={
        <div className="flex items-center gap-2.5 text-amber-400">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-white font-bold">Definir Nova Senha Pessoal</span>
        </div>
      }
      description="Você acessou a plataforma utilizando uma senha temporária. Para sua segurança, defina agora sua senha definitiva antes de prosseguir."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Senha Atual (Temporária recebida por e-mail) *</label>
          <Input
            required
            type="password"
            placeholder="Digite a senha temporária"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Nova Senha Pessoal *</label>
          <Input
            required
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Confirmar Nova Senha *</label>
          <Input
            required
            type="password"
            placeholder="Digite novamente a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<CheckCircle2 className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => logout()}
            className="text-slate-400 hover:text-slate-200"
          >
            Sair da Conta
          </Button>

          <Button
            type="submit"
            variant="teal"
            size="sm"
            isLoading={isLoading}
            className="font-bold"
          >
            Salvar e Acessar o Sistema
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default MandatoryChangePasswordModal;
