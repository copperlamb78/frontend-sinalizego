import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/config/api.config';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const resetSchema = z
  .object({
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua nova senha')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas informadas não conferem',
    path: ['confirmPassword']
  });

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema)
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!token) {
      toast.error('Token de redefinição inválido ou expirado.');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword
      });
      setIsSuccess(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Não foi possível redefinir sua senha. O link pode ter expirado.';
      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <h2 className="text-lg font-bold text-red-400">Link Inválido</h2>
        <p className="text-xs text-[#94A3B8]">
          O link de redefinição de senha está incompleto ou expirado.
        </p>
        <Link to="/esqueci-minha-senha">
          <Button variant="outline" size="sm">Solicitar Novo Link</Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-[#F8FAFC]">Senha Atualizada!</h2>
          <p className="text-xs text-[#94A3B8]">
            Sua senha foi redefinida com sucesso. Você já pode fazer login na plataforma.
          </p>
        </div>
        <Button onClick={() => navigate('/login')} className="w-full">
          Ir para o Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-[#F8FAFC]">Criar Nova Senha</h2>
        <p className="text-xs text-[#94A3B8]">
          Digite a sua nova senha de acesso
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nova Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Confirmar Nova Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repita a nova senha"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full h-11 text-sm font-bold"
          isLoading={isSubmitting}
        >
          Salvar Nova Senha
        </Button>
      </form>
    </div>
  );
};
