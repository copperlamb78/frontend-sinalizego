import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, setAuthTokens } from '@/config/api.config';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Store,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Step 1 Validation Schema: Only Category and Business Name
const step1Schema = z.object({
  category: z.string().min(1, 'Selecione o tipo de negócio'),
  name: z.string().min(3, 'O nome do estabelecimento deve ter pelo menos 3 caracteres')
});

// Step 2 Validation Schema: Detailed Address
const step2Schema = z.object({
  state: z.string().min(2, 'Selecione o estado (UF)'),
  city: z.string().min(2, 'Informe a cidade'),
  district: z.string().min(2, 'Informe o bairro'),
  street: z.string().min(3, 'Informe a rua / avenida'),
  number: z.string().min(1, 'Informe o número ou "S/N"'),
  zipCode: z.string().optional(),
  phone: z.string().optional()
});

// Complete Schema for combined data
const onboardingFullSchema = step1Schema.and(step2Schema);

type OnboardingFormData = z.infer<typeof onboardingFullSchema>;

const PROVIDER_TYPES = [
  'Barbearia',
  'Salão de Beleza',
  'Estúdio',
  'Clínica de Estética',
  'Esmalteria',
  'Outro'
];

const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' }
];

export const CompanyOnboardingPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFullSchema),
    defaultValues: {
      category: 'Barbearia',
      state: 'SP',
      phone: user?.phone || ''
    }
  });

  const handleNextStep = async () => {
    setServerError(null);
    const isValid = await trigger(['category', 'name']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setServerError(null);
    setCurrentStep(1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setServerError(null);
    try {
      const contactPhone = data.phone || user?.phone || '11999999999';

      // Payload strictly matching POST /api/v1/company/create contract in docs/llm.md
      const payload = {
        businessName: data.name.trim(),
        providerType: data.category,
        phone: contactPhone.replace(/\D/g, ''),
        state: data.state,
        city: data.city.trim(),
        district: data.district.trim(),
        street: data.street.trim(),
        number: data.number.trim(),
        zipCode: data.zipCode?.replace(/\D/g, '') || '00000000'
      };

      // POST /api/v1/company/create
      const response = await api.post('/company/create', payload);

      // Ingest new tokens with elevated COMPANY_OWNER role
      if (response.data?.access_token && response.data?.refresh_token) {
        setAuthTokens({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token
        });
      }

      await refreshProfile();
      toast.success('Estabelecimento configurado com sucesso! Bem-vindo ao painel.');
      navigate('/painel', { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Não foi possível criar o estabelecimento. Tente novamente mais tarde.';
      const formattedMessage = Array.isArray(message) ? message.join(', ') : message;
      setServerError(formattedMessage);
      toast.error(formattedMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Step Indicator */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configuração Rápida do Estabelecimento</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            {currentStep === 1 ? 'Dados do seu Negócio' : 'Onde seu espaço está localizado?'}
          </h2>
          <p className="text-xs text-[#94A3B8]">
            {currentStep === 1
              ? 'Etapa 1 de 2 • Tipo de serviço e nome do seu estabelecimento'
              : 'Etapa 2 de 2 • Endereço para os clientes encontrarem você'}
          </p>
        </div>

        {/* Green Top Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className={cn(
              'h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-300',
              currentStep === 1 ? 'w-1/2' : 'w-full'
            )}
          />
        </div>
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ==================== ETAPA 1: DADOS DO NEGÓCIO ==================== */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Category Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#94A3B8] tracking-wide uppercase">
                Tipo de Negócio / Categoria
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <select
                  className={cn(
                    'w-full h-11 pl-11 pr-4 rounded-xl bg-[#1E293B] text-[#F8FAFC] border border-slate-700/80 transition-all duration-200',
                    'focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 cursor-pointer',
                    errors.category && 'border-red-500'
                  )}
                  {...register('category')}
                >
                  {PROVIDER_TYPES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1E293B] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="text-xs text-red-400 font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Business Name */}
            <Input
              label="Nome do Estabelecimento"
              placeholder="Ex: Barbearia Vintage Club"
              leftIcon={<Store className="w-4 h-4" />}
              helperText="O link da sua vitrine pública será gerado automaticamente a partir do nome"
              error={errors.name?.message}
              {...register('name')}
            />

            <Button
              type="button"
              onClick={handleNextStep}
              className="w-full h-12 text-sm font-bold mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Prosseguir para Endereço
            </Button>
          </div>
        )}

        {/* ==================== ETAPA 2: ENDEREÇO COMPLETO ==================== */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* State (UF) and City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-[#94A3B8] tracking-wide uppercase">
                  Estado (UF)
                </label>
                <select
                  className={cn(
                    'w-full h-11 px-3 rounded-xl bg-[#1E293B] text-[#F8FAFC] border border-slate-700/80 transition-all duration-200',
                    'focus:outline-none focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 cursor-pointer',
                    errors.state && 'border-red-500'
                  )}
                  {...register('state')}
                >
                  {BRAZILIAN_STATES.map((st) => (
                    <option key={st.uf} value={st.uf} className="bg-[#1E293B] text-white">
                      {st.name} ({st.uf})
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-400 font-medium">{errors.state.message}</p>
                )}
              </div>

              <Input
                label="Cidade"
                placeholder="Ex: São Paulo"
                leftIcon={<Building2 className="w-4 h-4" />}
                error={errors.city?.message}
                {...register('city')}
              />
            </div>

            {/* Neighborhood / District */}
            <Input
              label="Bairro"
              placeholder="Ex: Centro / Bela Vista"
              leftIcon={<MapPin className="w-4 h-4" />}
              error={errors.district?.message}
              {...register('district')}
            />

            {/* Street and Number */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Rua / Avenida"
                  placeholder="Ex: Av. Paulista"
                  error={errors.street?.message}
                  {...register('street')}
                />
              </div>
              <div>
                <Input
                  label="Número"
                  placeholder="1000"
                  error={errors.number?.message}
                  {...register('number')}
                />
              </div>
            </div>

            {/* Optional CEP */}
            <Input
              label="CEP (Opcional)"
              placeholder="00000-000"
              error={errors.zipCode?.message}
              {...register('zipCode')}
            />

            {/* Action Buttons: Back + Submit */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevStep}
                className="w-1/3 h-12 text-sm font-semibold"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Voltar
              </Button>

              <Button
                type="submit"
                className="w-2/3 h-12 text-sm font-bold"
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Finalizar e Abrir Painel
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
