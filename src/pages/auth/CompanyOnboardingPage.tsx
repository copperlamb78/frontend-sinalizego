import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, setAuthTokens } from '@/config/api.config';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Building2, Link2, MapPin, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const onboardingSchema = z.object({
  name: z.string().min(3, 'Nome da barbearia/estúdio obrigatório'),
  slug: z
    .string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e traços (ex: barbearia-vintage)'),
  phone: z.string().min(10, 'Telefone de atendimento da barbearia'),
  address: z.string().optional()
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const CompanyOnboardingPage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema)
  });

  const watchName = watch('name');

  const handleNameBlur = () => {
    if (watchName && !watch('slug')) {
      const generatedSlug = watchName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      // POST /company/create - Returns new pair of tokens with COMPANY_OWNER role
      const response = await api.post('/company/create', data);
      
      if (response.data?.access_token && response.data?.refresh_token) {
        setAuthTokens({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token
        });
      }

      await refreshProfile();
      toast.success('Barbearia cadastrada com sucesso! Bem-vindo ao painel.');
      navigate('/painel');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Erro ao criar o estabelecimento. Verifique se o slug já está em uso.';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Passo Final • Onboarding da Empresa</span>
        </div>
        <h2 className="text-xl font-bold text-[#F8FAFC]">Configure sua Barbearia</h2>
        <p className="text-xs text-[#94A3B8]">
          Preencha os dados do seu estabelecimento para ativar sua vitrine pública
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome do Estabelecimento"
          placeholder="Ex: Barbearia Vintage Club"
          leftIcon={<Building2 className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
          onBlur={handleNameBlur}
        />

        <Input
          label="Link / Slug da Vitrine Pública"
          placeholder="ex: vintage-club"
          leftIcon={<Link2 className="w-4 h-4" />}
          helperText="Sua vitrine ficará em: sinalizego.com/empresa/seu-slug"
          error={errors.slug?.message}
          {...register('slug')}
        />

        <Input
          label="WhatsApp / Telefone de Contato"
          placeholder="11999999999"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Endereço Completo (Opcional)"
          placeholder="Rua, Número, Bairro - Cidade, UF"
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.address?.message}
          {...register('address')}
        />

        <Button
          type="submit"
          className="w-full h-12 text-sm font-bold mt-2"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Criar Estabelecimento & Acessar Painel
        </Button>
      </form>
    </div>
  );
};
