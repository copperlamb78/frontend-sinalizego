import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Input, Button } from '@/design-system';
import { useAuth } from '../hooks/useAuth';
import { formatPhoneMask, cleanPhoneDigits } from '../utils/phone';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, 'O nome deve ter no mínimo 3 caracteres')
      .max(80, 'Nome muito longo'),
    email: z
      .string()
      .min(1, 'O e-mail é obrigatório')
      .email('Informe um formato de e-mail válido'),
    phone: z
      .string()
      .min(14, 'Informe o DDD e o número completo (mínimo 10 dígitos)')
      .refine(
        (val) => val.replace(/\D/g, '').length >= 10,
        'O número de telefone deve ter pelo menos 10 dígitos com DDD'
      ),
    password: z
      .string()
      .min(6, 'A senha deve ter no mínimo 6 caracteres')
      .max(64, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirme a sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '/';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const sanitizedPhone = cleanPhoneDigits(data.phone);

      await registerUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: sanitizedPhone,
        password: data.password,
      });

      toast.success('Conta criada com sucesso! Você já está autenticado.', {
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      });

      navigate(redirectUrl, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 409) {
          setServerError(
            'Este e-mail já está cadastrado no sistema. Acesse sua conta ou recupere sua senha.'
          );
        } else if (status === 400) {
          if (Array.isArray(message)) {
            setServerError(message.join('. '));
          } else {
            setServerError(message || 'Dados inválidos. Verifique as informações preenchidas.');
          }
        } else if (status === 429) {
          setServerError(
            'Muitas contas criadas em um curto intervalo. Aguarde alguns minutos antes de tentar novamente.'
          );
        } else if (typeof message === 'string') {
          setServerError(message);
        } else {
          setServerError('Não foi possível concluir o cadastro. Tente novamente mais tarde.');
        }
      } else {
        setServerError('Ocorreu um erro inesperado ao realizar o cadastro.');
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

      {/* NOME COMPLETO */}
      <Input
        label="Nome Completo"
        type="text"
        placeholder="Ex: João da Silva"
        autoComplete="name"
        leftIcon={<UserIcon className="h-4 w-4" />}
        errorMessage={errors.name?.message}
        disabled={isSubmitting}
        data-testid="register-name-input"
        {...register('name')}
      />

      {/* E-MAIL */}
      <Input
        label="E-mail"
        type="email"
        placeholder="seu@email.com"
        autoComplete="email"
        leftIcon={<Mail className="h-4 w-4" />}
        errorMessage={errors.email?.message}
        disabled={isSubmitting}
        data-testid="register-email-input"
        {...register('email')}
      />

      {/* TELEFONE COM MÁSCARA */}
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <Input
            label="WhatsApp / Celular"
            type="tel"
            placeholder="(11) 99999-9999"
            autoComplete="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            errorMessage={errors.phone?.message}
            disabled={isSubmitting}
            data-testid="register-phone-input"
            value={field.value}
            onChange={(e) => {
              const formatted = formatPhoneMask(e.target.value);
              field.onChange(formatted);
            }}
            onBlur={field.onBlur}
            name={field.name}
          />
        )}
      />

      {/* SENHA */}
      <Input
        label="Senha"
        type={showPassword ? 'text' : 'password'}
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
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
        data-testid="register-password-input"
        {...register('password')}
      />

      {/* CONFIRMAÇÃO DE SENHA */}
      <Input
        label="Confirmar Senha"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Repita sua senha"
        autoComplete="new-password"
        leftIcon={<Lock className="h-4 w-4" />}
        rightAction={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-text-muted hover:text-text-primary focus:outline-none p-1 cursor-pointer transition-colors"
            aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Exibir confirmação'}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        errorMessage={errors.confirmPassword?.message}
        disabled={isSubmitting}
        data-testid="register-confirm-password-input"
        {...register('confirmPassword')}
      />

      {/* BOTÃO DE SUBMIT */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-2"
        isLoading={isSubmitting}
        loadingText="Cadastrando..."
        leftIcon={<UserPlus className="h-4 w-4" />}
        data-testid="register-submit-button"
      >
        Criar Minha Conta
      </Button>

      {/* LINK PARA LOGIN */}
      <div className="pt-4 border-t border-border/60 text-center">
        <p className="text-xs text-text-secondary">
          Já possui uma conta?{' '}
          <Link
            to={`/login${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="font-bold text-primary hover:underline ml-1"
          >
            Acessar conta
          </Link>
        </p>
      </div>
    </form>
  );
};
