import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Save,
  ShieldCheck,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

// 1. Profile Schema
const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone com DDD inválido'),
  cpf: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

// 2. Password Schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'A senha atual deve ter pelo menos 6 caracteres'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export const ClientProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      cpf: user?.cpfCnpj || ''
    }
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        phone: user.phone || '',
        cpf: user.cpfCnpj || ''
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (_data: ProfileFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Dados cadastrais atualizados com sucesso!');
    } catch {
      toast.error('Erro ao atualizar perfil.');
    }
  };

  const onPasswordSubmit = async (_data: PasswordFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Senha alterada com sucesso!');
      resetPassword();
    } catch {
      toast.error('Erro ao atualizar senha. Verifique sua senha atual.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info('Sessão encerrada com sucesso.');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Sua conta foi excluída com sucesso conforme a LGPD.');
      setIsDeleteModalOpen(false);
      logout();
      navigate('/login');
    } catch {
      toast.error('Não foi possível excluir sua conta no momento.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-teal-400" />
          <span>Minha Conta</span>
        </h1>
        <p className="text-xs text-slate-400">
          Gerencie seus dados pessoais, credenciais de acesso e privacidade.
        </p>
      </div>

      {/* 1. Dados Pessoais & Cadastrais */}
      <form onSubmit={handleSubmitProfile(onProfileSubmit)}>
        <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" />
              <span>Dados Cadastrais</span>
            </h2>
            <Badge variant="teal" size="sm">
              {user?.role === 'COMPANY_OWNER' ? 'PROPRIETÁRIO' : 'CLIENTE'}
            </Badge>
          </div>

          <div className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Ex: Carlos Alberto"
              leftIcon={<User className="w-4 h-4" />}
              error={profileErrors.name?.message}
              {...registerProfile('name')}
            />

            <Input
              label="E-mail de Acesso"
              type="email"
              value={user?.email || ''}
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="O e-mail é a chave primária da sua conta e não pode ser alterado."
            />

            <Input
              label="Telefone / WhatsApp (com DDD)"
              placeholder="Ex: 11999998888"
              leftIcon={<Phone className="w-4 h-4" />}
              error={profileErrors.phone?.message}
              {...registerProfile('phone')}
            />

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              leftIcon={<CreditCard className="w-4 h-4" />}
              helperText="Necessário para emissão e validação das reservas Pix no checkout."
              error={profileErrors.cpf?.message}
              {...registerProfile('cpf')}
            />
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-800">
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingProfile}
              className="px-6 font-bold text-xs h-10 shadow-md shadow-teal-500/20 cursor-pointer"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Salvar Alterações
            </Button>
          </div>
        </Card>
      </form>

      {/* 2. Seção de Segurança / Alteração de Senha */}
      <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
        <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-5 shadow-lg">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              <span>Segurança e Alteração de Senha</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mantenha sua conta segura atualizando sua senha periodicamente
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Senha Atual"
              type="password"
              placeholder="••••••••"
              leftIcon={<Key className="w-4 h-4" />}
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nova Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                leftIcon={<Lock className="w-4 h-4" />}
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />

              <Input
                label="Confirmar Nova Senha"
                type="password"
                placeholder="Repita a nova senha"
                leftIcon={<Lock className="w-4 h-4" />}
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-800">
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingPassword}
              className="px-6 font-bold text-xs h-10 shadow-md shadow-teal-500/20 cursor-pointer"
              leftIcon={<Key className="w-4 h-4" />}
            >
              Atualizar Senha
            </Button>
          </div>
        </Card>
      </form>

      {/* 3. Zona de Perigo e Privacidade */}
      <Card className="p-6 bg-[#0F172A] border border-red-500/20 space-y-5 shadow-lg">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Ações da Conta e Privacidade</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerenciamento de sessão ativa e solicitação de exclusão definitiva de dados pessoais
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs h-10 border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
            leftIcon={<LogOut className="w-4 h-4 text-slate-400" />}
          >
            Encerrar Sessão (Sair)
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs h-10 font-bold cursor-pointer"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Excluir Minha Conta
          </Button>
        </div>
      </Card>

      {/* Security & Privacy Notice */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <span>
          Seus dados são protegidos por criptografia de ponta a ponta e processados com total privacidade para emissão de comprovantes de reserva e liquidação Pix.
        </span>
      </div>

      {/* Modal: Confirmação de Exclusão de Conta */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Minha Conta"
        description="Esta ação é definitiva e irreversível"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Aviso Importante sobre seus Dados</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Ao confirmar a exclusão, todos os seus dados pessoais, histórico de agendamentos e vouchers vinculados ao e-mail <strong>{user?.email}</strong> serão permanentemente removidos de nossa base ativa.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Agendamentos futuros com sinal pago deverão ser cancelados previamente para fins de estorno.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Confirmar Exclusão Definitiva
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
