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
import { formatCepMask, cleanCepDigits } from '../utils/cep';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Scissors,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Tag,
} from 'lucide-react';

const registerCompanySchema = z
  .object({
    // Responsável
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    email: z.string().min(1, 'O e-mail é obrigatório').email('Informe um e-mail válido'),
    phone: z
      .string()
      .min(14, 'Informe o DDD e o número completo')
      .refine((val) => val.replace(/\D/g, '').length >= 10, 'Telefone incompleto'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),

    // Negócio
    businessName: z.string().min(2, 'Informe o nome do estabelecimento'),
    providerType: z.string().min(2, 'Selecione ou informe o tipo de negócio'),

    // Endereço
    zipCode: z.string().min(8, 'Informe um CEP válido'),
    street: z.string().min(2, 'Informe o endereço / logradouro'),
    number: z.string().min(1, 'Informe o número ou S/N'),
    district: z.string().min(2, 'Informe o bairro'),
    city: z.string().min(2, 'Informe a cidade'),
    state: z.string().min(2, 'Informe o estado (UF)'),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterCompanyFormData = z.infer<typeof registerCompanySchema>;

export const RegisterCompanyForm: React.FC = () => {
  const { registerCompany } = useAuth();
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompanyFormData>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      providerType: 'Barbearia',
      zipCode: '',
      street: '',
      number: '',
      district: '',
      city: '',
      state: '',
      referralCode: '',
    },
  });

  // Busca automática de endereço por CEP (ViaCEP)
  const handleCepBlur = async (cepValue: string) => {
    const rawCep = cleanCepDigits(cepValue);
    if (rawCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setValue('street', data.logradouro);
          if (data.bairro) setValue('district', data.bairro);
          if (data.localidade) setValue('city', data.localidade);
          if (data.uf) setValue('state', data.uf);
        }
      } catch {
        // Ignora silenciosamente falha externa de busca de CEP
      }
    }
  };

  const onSubmit = async (data: RegisterCompanyFormData) => {
    setServerError(null);
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: cleanPhoneDigits(data.phone),
        businessName: data.businessName.trim(),
        providerType: data.providerType,
        zipCode: cleanCepDigits(data.zipCode),
        street: data.street.trim(),
        number: data.number.trim(),
        district: data.district.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        referralCode: data.referralCode?.trim() || undefined,
      };

      const res = await registerCompany(payload);

      toast.success('Empresa cadastrada com sucesso! Bem-vindo ao SinalizeGO.', {
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
      });

      // Redireciona para vitrine da empresa ou página inicial
      const targetSlug = res.user.companies?.[0]?.slug;
      if (targetSlug) {
        navigate(`/empresa/${targetSlug}`, { replace: true });
      } else {
        navigate(redirectUrl, { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 409) {
          setServerError(
            'Este e-mail já está em uso na plataforma. Acesse sua conta existente.'
          );
        } else if (status === 400) {
          if (Array.isArray(message)) {
            setServerError(message.join('. '));
          } else {
            setServerError(message || 'Dados inválidos. Verifique as informações preenchidas.');
          }
        } else if (typeof message === 'string') {
          setServerError(message);
        } else {
          setServerError('Não foi possível cadastrar o estabelecimento. Tente novamente mais tarde.');
        }
      } else {
        setServerError('Ocorreu um erro inesperado ao realizar o cadastro.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {serverError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-medium flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* SEÇÃO 1: DADOS DO ESTABELECIMENTO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border/60">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Dados do Estabelecimento
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome da Barbearia / Salão"
            type="text"
            placeholder="Ex: Barber's Club"
            errorMessage={errors.businessName?.message}
            disabled={isSubmitting}
            data-testid="company-business-name-input"
            {...register('businessName')}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-primary mb-1.5 select-none">
              Tipo de Negócio
            </label>
            <div className="flex items-center h-11 w-full rounded-[4px] border border-border bg-surface px-3">
              <select
                className="w-full bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
                disabled={isSubmitting}
                data-testid="company-provider-type-select"
                {...register('providerType')}
              >
                <option value="Barbearia">Barbearia</option>
                <option value="Salão de Beleza">Salão de Beleza</option>
                <option value="Estúdio de Tatuagem">Estúdio de Tatuagem</option>
                <option value="Clínica de Estética">Clínica de Estética</option>
                <option value="Outro">Outro Estabelecimento</option>
              </select>
            </div>
            {errors.providerType && (
              <p className="text-[11px] text-danger mt-1">{errors.providerType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: DADOS DO RESPONSÁVEL */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border/60">
          <UserIcon className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Responsável / Dono do Negócio
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nome Completo"
            type="text"
            placeholder="Ex: Carlos Alberto"
            leftIcon={<UserIcon className="h-4 w-4" />}
            errorMessage={errors.name?.message}
            disabled={isSubmitting}
            data-testid="company-owner-name-input"
            {...register('name')}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                label="WhatsApp Comercial"
                type="tel"
                placeholder="(11) 99999-9999"
                leftIcon={<Phone className="h-4 w-4" />}
                errorMessage={errors.phone?.message}
                disabled={isSubmitting}
                data-testid="company-phone-input"
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
        </div>

        <Input
          label="E-mail de Acesso"
          type="email"
          placeholder="contato@barbearia.com"
          leftIcon={<Mail className="h-4 w-4" />}
          errorMessage={errors.email?.message}
          disabled={isSubmitting}
          data-testid="company-email-input"
          {...register('email')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            leftIcon={<Lock className="h-4 w-4" />}
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-primary p-1 cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            errorMessage={errors.password?.message}
            disabled={isSubmitting}
            data-testid="company-password-input"
            {...register('password')}
          />

          <Input
            label="Confirmar Senha"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repita sua senha"
            leftIcon={<Lock className="h-4 w-4" />}
            rightAction={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-text-muted hover:text-text-primary p-1 cursor-pointer"
                aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Exibir confirmação'}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            errorMessage={errors.confirmPassword?.message}
            disabled={isSubmitting}
            data-testid="company-confirm-password-input"
            {...register('confirmPassword')}
          />
        </div>
      </div>

      {/* SEÇÃO 3: LOCALIZAÇÃO E ENDEREÇO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-border/60">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Endereço do Estabelecimento
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => (
              <Input
                label="CEP"
                type="text"
                placeholder="44085-370"
                errorMessage={errors.zipCode?.message}
                disabled={isSubmitting}
                data-testid="company-zip-input"
                value={field.value}
                onChange={(e) => {
                  const formatted = formatCepMask(e.target.value);
                  field.onChange(formatted);
                }}
                onBlur={(e) => {
                  field.onBlur();
                  handleCepBlur(e.target.value);
                }}
                name={field.name}
              />
            )}
          />

          <div className="sm:col-span-2">
            <Input
              label="Rua / Avenida"
              type="text"
              placeholder="Ex: Av. Artêmia Pires Freitas"
              errorMessage={errors.street?.message}
              disabled={isSubmitting}
              data-testid="company-street-input"
              {...register('street')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Número"
            type="text"
            placeholder="123"
            errorMessage={errors.number?.message}
            disabled={isSubmitting}
            data-testid="company-number-input"
            {...register('number')}
          />

          <Input
            label="Bairro"
            type="text"
            placeholder="SIM"
            errorMessage={errors.district?.message}
            disabled={isSubmitting}
            data-testid="company-district-input"
            {...register('district')}
          />

          <Input
            label="Cidade"
            type="text"
            placeholder="Feira de Santana"
            errorMessage={errors.city?.message}
            disabled={isSubmitting}
            data-testid="company-city-input"
            {...register('city')}
          />

          <Input
            label="Estado (UF)"
            type="text"
            placeholder="BA"
            errorMessage={errors.state?.message}
            disabled={isSubmitting}
            data-testid="company-state-input"
            {...register('state')}
          />
        </div>

        {/* CÓDIGO DE INDICAÇÃO OPCIONAL */}
        <Input
          label="Código de Indicação (Opcional)"
          type="text"
          placeholder="Código de quem indicou você (se houver)"
          leftIcon={<Tag className="h-4 w-4" />}
          errorMessage={errors.referralCode?.message}
          disabled={isSubmitting}
          data-testid="company-referral-input"
          {...register('referralCode')}
        />
      </div>

      {/* BOTÃO DE SUBMIT */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full mt-4"
        isLoading={isSubmitting}
        loadingText="Criando estabelecimento..."
        leftIcon={<Scissors className="h-4 w-4" />}
        data-testid="company-submit-button"
      >
        Cadastrar Meu Estabelecimento
      </Button>

      {/* LINK PARA LOGIN */}
      <div className="pt-3 border-t border-border/60 text-center">
        <p className="text-xs text-text-secondary">
          Já possui conta cadastrada?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline ml-1">
            Acessar conta
          </Link>
        </p>
      </div>
    </form>
  );
};
