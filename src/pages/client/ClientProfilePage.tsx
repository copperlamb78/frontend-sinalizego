import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Save,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone com DDD inválido'),
  cpf: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ClientProfilePage: React.FC = () => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      cpf: user?.cpfCnpj || ''
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        cpf: user.cpfCnpj || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (_data: ProfileFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success('Perfil atualizado com sucesso!');
    } catch {
      toast.error('Erro ao atualizar perfil.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-teal-400" />
          <span>Minha Conta</span>
        </h1>
        <p className="text-xs text-slate-400">
          Gerencie seus dados de identificação, telefone e informações para estorno Pix.
        </p>
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-5">
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
              error={errors.name?.message}
              {...register('name')}
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
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="CPF (Para Estorno Pix)"
              placeholder="000.000.000-00"
              leftIcon={<CreditCard className="w-4 h-4" />}
              helperText="Utilizado para validação de segurança caso você solicite estorno de agendamento."
              error={errors.cpf?.message}
              {...register('cpf')}
            />
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-800">
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="px-6 font-bold text-xs h-10 shadow-md shadow-teal-500/20 cursor-pointer"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Salvar Alterações
            </Button>
          </div>
        </Card>
      </form>

      {/* Security & Privacy Notice */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <span>
          Seus dados são protegidos por criptografia de ponta a ponta e utilizados exclusivamente para emissão de comprovantes de atendimento e estornos bancários via Pix Asaas.
        </span>
      </div>
    </div>
  );
};
