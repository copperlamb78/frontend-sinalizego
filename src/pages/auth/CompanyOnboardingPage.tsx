import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, setAuthTokens } from '@/config/api.config';
import { useAuth } from '@/contexts/auth.context';
import { fetchAddressByCep } from '@/services/cep.service';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Store,
  Layers,
  Search,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DRAFT_STORAGE_KEY = '@sinalizego:onboarding_company_draft';

// Step 1: Owner Profile + Business Details
const step1Schema = z.object({
  name: z.string().min(3, 'Informe seu nome completo'),
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone: z
    .string()
    .min(10, 'Insira um WhatsApp/telefone válido com DDD')
    .regex(/^[0-9()\s-+]+$/, 'Formato de telefone inválido'),
  providerType: z.string().min(1, 'Selecione o tipo de negócio'),
  businessName: z.string().min(3, 'O nome do estabelecimento deve ter pelo menos 3 caracteres')
});

// Step 2: Address Details + Terms
const step2Schema = z.object({
  zipCode: z.string().optional(),
  state: z.string().min(2, 'Selecione o estado (UF)'),
  city: z.string().min(2, 'Informe a cidade'),
  district: z.string().min(2, 'Informe o bairro'),
  street: z.string().min(3, 'Informe a rua / avenida'),
  number: z.string().min(1, 'Informe o número ou "S/N"'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os Termos de Uso para continuar' })
  })
});

// Combined schema
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
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Load draft from storage or pre-fill with logged-in user
  const getInitialValues = (): Partial<OnboardingFormData> => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage error
    }
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      providerType: 'Barbearia',
      businessName: '',
      state: 'SP',
      terms: true as any
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFullSchema),
    defaultValues: getInitialValues()
  });

  const rawPhone = watch('phone') || '';
  const rawZipCode = watch('zipCode') || '';

  // If we are on step 2 but password is empty (e.g. after a page reload), force user back to step 1
  const currentPassword = watch('password');
  useEffect(() => {
    if (currentStep === 2 && !currentPassword) {
      setCurrentStep(1);
    }
  }, [currentStep, currentPassword]);

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

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? raw.replace(/^(\d{5})(\d{1,3})/, '$1-$2') : raw;
    setValue('zipCode', formatted);

    if (raw.length === 8) {
      handleLookupCep(raw);
    }
  };

  const handleLookupCep = async (cepToQuery?: string) => {
    const clean = (cepToQuery || rawZipCode).replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const address = await fetchAddressByCep(clean);
      if (address) {
        if (address.state) {
          setValue('state', address.state.toUpperCase(), { shouldValidate: true });
        }
        if (address.city) {
          setValue('city', address.city, { shouldValidate: true });
        }
        if (address.neighborhood) {
          setValue('district', address.neighborhood, { shouldValidate: true });
        }
        if (address.street) {
          setValue('street', address.street, { shouldValidate: true });
        }
        toast.success('Endereço preenchido automaticamente pelo CEP!');
      } else {
        toast.info('CEP não localizado. Por favor, preencha o endereço manualmente.');
      }
    } catch {
      toast.info('Não foi possível buscar o CEP automaticamente. Preencha manualmente.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleNextStep = async () => {
    setServerError(null);
    const isValid = await trigger(['name', 'email', 'password', 'phone', 'providerType', 'businessName']);
    if (isValid) {
      // Save draft upon successful step 1 completion instead of every keystroke
      try {
        const formValues = getValues();
        const { password, ...safeFormValues } = formValues;
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(safeFormValues));
      } catch {
        // storage unavailable
      }
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
      const cleanPhone = data.phone.replace(/\D/g, '');

      // Single atomic request: POST /api/v1/company/create
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: cleanPhone,
        businessName: data.businessName.trim(),
        providerType: data.providerType,
        state: data.state,
        city: data.city.trim(),
        district: data.district.trim(),
        street: data.street.trim(),
        number: data.number.trim(),
        zipCode: data.zipCode?.replace(/\D/g, '') || '00000000'
      };

      const response = await api.post('/company/create', payload);

      // Ingest tokens and authenticate immediately
      if (response.data?.access_token && response.data?.refresh_token) {
        setAuthTokens({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token
        });
      }

      // Clear draft
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_STORAGE_KEY); // Clean up legacy plaintext leak

      await refreshProfile();
      toast.success('Estabelecimento cadastrado com sucesso! Bem-vindo ao painel.');
      navigate('/painel', { replace: true });
    } catch (err: any) {
      let formattedMessage = 'Não foi possível cadastrar o estabelecimento.';
      if (err.code === 'ERR_NETWORK' || !err.response) {
        formattedMessage =
          'Servidor backend indisponível em http://localhost:3000. Verifique se a API está em execução.';
      } else if (err.response?.data?.message) {
        const message = err.response.data.message;
        formattedMessage = Array.isArray(message) ? message.join(', ') : message;
      }
      setServerError(formattedMessage);
      toast.error(formattedMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Step Indicator */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Cadastro de Estabelecimento & Dono</span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">
            {currentStep === 1 ? 'Seus Dados & Seu Estabelecimento' : 'Onde seu salão está localizado?'}
          </h2>
          <p className="text-xs text-[#94A3B8]">
            {currentStep === 1
              ? 'Etapa 1 de 2 • Dados de acesso e nome do espaço'
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
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium leading-relaxed">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ==================== ETAPA 1: DADOS DO DONO & NEGÓCIO ==================== */}
        {currentStep === 1 && (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-200">
            <Input
              label="Seu Nome Completo"
              placeholder="Ex: Carlos Alberto"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Seu E-mail de Acesso"
              type="email"
              placeholder="carlos@exemplo.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                label="Senha de Acesso"
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
            </div>

            {/* Business Category */}
            <div className="space-y-1.5 text-left pt-1">
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
                    errors.providerType && 'border-red-500'
                  )}
                  {...register('providerType')}
                >
                  {PROVIDER_TYPES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1E293B] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {errors.providerType && (
                <p className="text-xs text-red-400 font-medium">{errors.providerType.message}</p>
              )}
            </div>

            {/* Business Name */}
            <Input
              label="Nome do Estabelecimento"
              placeholder="Ex: Barbearia Vintage Club"
              leftIcon={<Store className="w-4 h-4" />}
              helperText="O link da sua vitrine de agendamentos será gerado automaticamente a partir do nome"
              error={errors.businessName?.message}
              {...register('businessName')}
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
            {/* CEP with BrasilAPI Lookup */}
            <div className="space-y-1">
              <Input
                label="CEP"
                placeholder="00000-000"
                value={rawZipCode}
                onChange={handleCepChange}
                onBlur={() => handleLookupCep()}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                rightIcon={
                  isLoadingCep ? (
                    <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                  ) : undefined
                }
                helperText="Digite o CEP para preencher o endereço automaticamente"
                error={errors.zipCode?.message}
              />
            </div>

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

            {/* Terms and Privacy Policy */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-[#1E293B] text-[#14B8A6] focus:ring-[#14B8A6] focus:ring-offset-0 transition-colors accent-[#14B8A6]"
                  {...register('terms')}
                />
                <span>
                  Li e concordo com os{' '}
                  <a href="/#termos" target="_blank" rel="noopener noreferrer" className="text-[#14B8A6] font-semibold hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a href="/#privacidade" target="_blank" rel="noopener noreferrer" className="text-[#14B8A6] font-semibold hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-400 font-medium">{errors.terms.message}</p>
              )}
            </div>

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

      <div className="pt-3 border-t border-slate-800 text-center text-xs text-[#94A3B8]">
        Já possui uma conta?{' '}
        <Link to="/login" className="text-[#14B8A6] font-bold hover:underline">
          Fazer Login
        </Link>
      </div>
    </div>
  );
};
