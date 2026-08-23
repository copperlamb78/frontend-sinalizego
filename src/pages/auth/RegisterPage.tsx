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
import { User, Mail, Lock, Phone, ArrowRight, Scissors, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone: z.string().min(10, 'Insira um telefone válido com DDD (ex: 11999999999)')
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState<'CLIENT' | 'COMPANY_OWNER'>('CLIENT');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      // POST /users/create
      await api.post('/users/create', {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: Role.CLIENT // All accounts start as CLIENT; creating a company promotes to OWNER
      });

      toast.success('Conta criada com sucesso!');

      // Auto login
      await login({ email: data.email, password: data.password });

      if (profileType === 'COMPANY_OWNER') {
        navigate('/onboarding/empresa');
      } else {
        navigate('/meus-agendamentos');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Não foi possível criar sua conta. Tente novamente mais tarde.';
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
          Escolha seu perfil e comece em menos de 1 minuto
        </p>
      </div>

      {/* Profile Type Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#1E293B] border border-slate-700/80">
        <button
          type="button"
          onClick={() => setProfileType('CLIENT')}
          className={cn(
            'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all',
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
            'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all',
            profileType === 'COMPANY_OWNER'
              ? 'bg-[#14B8A6] text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Tenho Barbearia</span>
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
          placeholder="Seu nome completo"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="exemplo@sinalizego.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="WhatsApp / Telefone"
          type="tel"
          placeholder="11999999999"
          leftIcon={<Phone className="w-4 h-4" />}
          helperText="Apenas números com DDD"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          className="w-full h-12 text-sm font-bold mt-2"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {profileType === 'COMPANY_OWNER' ? 'Cadastrar e Criar Barbearia' : 'Criar Conta de Cliente'}
        </Button>
      </form>

      <div className="pt-3 border-t border-slate-800 text-center text-xs text-[#94A3B8]">
        Já possui cadastro?{' '}
        <Link to="/login" className="text-[#14B8A6] font-bold hover:underline">
          Fazer Login
        </Link>
      </div>
    </div>
  );
};
