import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Input, Button } from '@/design-system';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Informe um formato de e-mail válido'),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      toast.success(`Bem-vindo de volta, ${response.user.name}!`);
      navigate(redirectUrl, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 401) {
          setServerError('Credenciais inválidas. Verifique seu e-mail e senha.');
        } else if (status === 429) {
          setServerError('Muitas tentativas em pouco tempo. Aguarde 1 minuto.');
        } else if (typeof message === 'string') {
          setServerError(message);
        } else {
          setServerError('Erro ao conectar com o servidor. Tente novamente.');
        }
      } else {
        setServerError('Ocorreu um erro inesperado ao realizar o login.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-medium flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* CAMPO DE E-MAIL */}
      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        autoComplete="email"
        leftIcon={<Mail className="h-4 w-4" />}
        errorMessage={errors.email?.message}
        disabled={isSubmitting}
        data-testid="login-email-input"
        {...register('email')}
      />

      {/* CAMPO DE SENHA */}
      <div className="space-y-1">
        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
          rightAction={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-primary focus:outline-none p-1 cursor-pointer transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          errorMessage={errors.password?.message}
          disabled={isSubmitting}
          data-testid="login-password-input"
          {...register('password')}
        />

        <div className="flex justify-end pt-1">
          <Link
            to="/recuperar-senha"
            className="text-xs text-text-muted hover:text-primary transition-colors font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>
      </div>

      {/* BOTÃO DE SUBMIT */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-2"
        isLoading={isSubmitting}
        loadingText="Acessando..."
        leftIcon={<LogIn className="h-4 w-4" />}
        data-testid="login-submit-button"
      >
        Acessar Conta
      </Button>

      {/* LINK PARA CADASTRO */}
      <div className="pt-4 border-t border-border/60 text-center">
        <p className="text-xs text-text-secondary">
          Ainda não tem uma conta?{' '}
          <Link
            to={`/cadastro${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="font-bold text-primary hover:underline ml-1"
          >
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </form>
  );
};
