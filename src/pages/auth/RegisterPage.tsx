import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/config/api.config';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Role } from '@/types/auth.types';
import { User, Mail, Lock, Phone, ArrowRight, Store, Calendar, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo'),
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone: z
    .string()
    .min(10, 'Insira um telefone válido com DDD (ex: 11999999999)')
    .regex(/^[0-9()\s-+]+$/, 'Formato de telefone inválido'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os Termos de Uso para continuar' })
  })
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState<'CLIENT' | 'COMPANY_OWNER'>('CLIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: true as any
    }
  });

  const rawPhone = watch('phone') || '';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length <= 10) {
      formatted = raw.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      formatted = raw.slice(0, 11).replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    setValue('phone', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const cleanPhone = data.phone.replace(/\D/g, '');

      // POST /users/create
      await api.post('/users/create', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: cleanPhone,
        role: Role.CLIENT // All accounts start with CLIENT; company onboarding promotes to OWNER
      });

      toast.success('Cadastro realizado com sucesso!');

      // Automatic login
      await login({ email: data.email, password: data.password });

      if (profileType === 'COMPANY_OWNER') {
        navigate('/onboarding/empresa');
      } else {
        navigate('/meus-agendamentos');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Não foi possível realizar o cadastro. Verifique os dados informados.';
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(formattedMessage);
      toast.error(formattedMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-[#F8FAFC]">Criar sua conta</h2>
        <p className="text-xs text-[#94A3B8]">
          Escolha como deseja utilizar a plataforma
        </p>
      </div>

      {/* Profile Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#1E293B] border border-slate-700/80">
        <button
          type="button"
          onClick={() => setProfileType('CLIENT')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
            profileType === 'CLIENT'
              ? 'bg-[#14B8A6] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Quero Agendar</span>
        </button>

        <button
          type="button"
          onClick={() => setProfileType('COMPANY_OWNER')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
            profileType === 'COMPANY_OWNER'
              ? 'bg-[#14B8A6] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Tenho Estabelecimento</span>
        </button>
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label="Nome Completo"
          placeholder="Seu nome e sobrenome"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="seuemail@exemplo.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="WhatsApp / Telefone"
          type="tel"
          placeholder="(11) 99999-9999"
          value={rawPhone}
          onChange={handlePhoneChange}
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
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

        {/* Mandatory terms checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-[#1E293B] text-[#14B8A6] focus:ring-[#14B8A6] focus:ring-offset-0 transition-colors accent-[#14B8A6]"
              {...register('terms')}
            />
            <span>
              Li e concordo com os{' '}
              <a href="/#termos" target="_blank" className="text-[#14B8A6] font-semibold hover:underline">
                Termos de Uso
              </a>{' '}
              e a{' '}
              <a href="/#privacidade" target="_blank" className="text-[#14B8A6] font-semibold hover:underline">
                Política de Privacidade
              </a>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-red-400 font-medium">{errors.terms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-sm font-bold mt-2"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {profileType === 'COMPANY_OWNER'
            ? 'Cadastrar e Configurar Estabelecimento'
            : 'Criar Minha Conta de Cliente'}
        </Button>
      </form>

      <div className="pt-3 border-t border-slate-800 text-center text-xs text-[#94A3B8]">
        Já possui uma conta?{' '}
        <Link to="/login" className="text-[#14B8A6] font-bold hover:underline">
          Fazer Login
        </Link>
      </div>
    </div>
  );
};
