import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Role } from '@/types/auth.types';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Insira um e-mail válido').min(1, 'E-mail obrigatório'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await login(data);
      toast.success(`Bem-vindo de volta, ${response.user.name.split(' ')[0]}!`);

      // Redirection based on role or intended destination
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      if (response.user.role === Role.SUPER_ADMIN || response.user.role === Role.ADMIN) {
        navigate('/admin', { replace: true });
      } else if (response.user.role === Role.COMPANY_OWNER) {
        navigate('/painel', { replace: true });
      } else {
        navigate('/meus-agendamentos', { replace: true });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Não foi possível autenticar. Verifique suas credenciais.';
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(formattedMessage);
      toast.error(formattedMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-[#F8FAFC]">Entrar na sua conta</h2>
        <p className="text-xs text-[#94A3B8]">
          Digite suas credenciais para gerenciar agendamentos
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="exemplo@sinalizego.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right">
            <Link
              to="/esqueci-minha-senha"
              className="text-[11px] text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-sm font-bold"
          isLoading={isSubmitting}
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Acessar Conta
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-[#94A3B8]">
        Ainda não tem uma conta?{' '}
        <Link to="/cadastro" className="text-[#14B8A6] font-bold hover:underline">
          Criar cadastro grátis
        </Link>
      </div>
    </div>
  );
};
