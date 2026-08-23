import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/config/api.config';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const forgotSchema = z.object({
  email: z.string().email('Insira um e-mail válido')
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      await api.post('/auth/forgot-password', data);
      setIsSuccess(true);
      toast.success('Solicitação enviada!');
    } catch (err) {
      // Always show success state for security anti-enumeration
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-[#F8FAFC]">Verifique seu E-mail</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Se o endereço de e-mail estiver cadastrado em nossa base, você receberá um link com instruções para redefinir sua senha com segurança.
          </p>
        </div>
        <Link to="/login" className="inline-block">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Voltar para o Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-[#F8FAFC]">Recuperar Senha</h2>
        <p className="text-xs text-[#94A3B8]">
          Informe seu e-mail cadastrado para receber o link de redefinição
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="E-mail Cadastrado"
          type="email"
          placeholder="exemplo@sinalizego.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          className="w-full h-11 text-sm font-bold"
          isLoading={isSubmitting}
        >
          Enviar Link de Recuperação
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o Login</span>
        </Link>
      </div>
    </div>
  );
};
