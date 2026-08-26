import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { companyService } from '@/services/company.service';
import { cepService } from '@/services/cep.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Building2,
  MapPin,
  Phone,
  Upload,
  Save,
  ExternalLink,
  Copy,
  Check,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const settingsSchema = z.object({
  businessName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  providerType: z.string().min(2, 'Selecione o tipo de estabelecimento'),
  chairsCount: z.coerce.number().min(1, 'Pelo menos 1 cadeira/profissional'),
  whatsapp: z.string().min(10, 'WhatsApp deve ter DDD + número'),
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().min(2, 'Logradouro obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  district: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF deve ter 2 letras')
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const OwnerSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // 1. Fetch Company Data
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-owner-settings'],
    queryFn: () => companyService.getCompanyByUserId()
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema)
  });

  // Populate form on load
  useEffect(() => {
    if (company) {
      reset({
        businessName: company.businessName || '',
        providerType: company.providerType || 'Barbearia',
        chairsCount: 3,
        whatsapp: company.whatsapp || '',
        zipCode: company.zipCode || '01310100',
        street: company.street || 'Avenida Paulista',
        number: company.number || '1000',
        district: company.district || 'Bela Vista',
        city: company.city || 'São Paulo',
        state: company.state || 'SP'
      });
      setLogoPreview(company.logoPhoto || null);
      setBannerPreview(company.bannerPhoto || null);
    }
  }, [company, reset]);

  // 2. Save Mutation
  const updateMutation = useMutation({
    mutationFn: (data: SettingsFormData) => {
      if (!company?.id) {
        throw new Error('Estabelecimento não encontrado');
      }
      return companyService.updateCompany(company.id, {
        ...data,
        logoPhoto: logoPreview,
        bannerPhoto: bannerPreview
      });
    },
    onSuccess: () => {
      toast.success('Configurações do estabelecimento atualizadas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['company-owner-settings'] });
      queryClient.invalidateQueries({ queryKey: ['company-by-slug'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Não foi possível salvar as configurações.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  // 3. CEP Auto-fill
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const rawCep = e.target.value;
    const cleanCep = rawCep.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      try {
        const address = await cepService.fetchAddressByCep(cleanCep);
        if (address) {
          setValue('street', address.street);
          setValue('district', address.neighborhood);
          setValue('city', address.city);
          setValue('state', address.state);
          toast.success('Endereço autopreenchido via BrasilAPI');
        }
      } catch {
        toast.error('CEP não encontrado. Preencha o endereço manualmente.');
      }
    }
  };

  // 4. File Upload Handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { url } = await companyService.uploadPhoto(file);
      setLogoPreview(url);
      toast.success('Logo atualizada com sucesso!');
    } catch {
      toast.error('Falha ao enviar logo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const { url } = await companyService.uploadPhoto(file);
      setBannerPreview(url);
      toast.success('Banner de capa atualizado!');
    } catch {
      toast.error('Falha ao enviar banner.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const storefrontUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/empresa/${company?.slug || ''}`
    : `/empresa/${company?.slug || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopiedLink(true);
    toast.success('Link da vitrine copiado para a área de transferência!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            <span>Configurações do Estabelecimento</span>
          </h1>
          <p className="text-xs text-slate-400">
            Personalize a vitrine pública, banner de capa, fotos e endereço da sua empresa.
          </p>
        </div>

        <Button
          type="submit"
          isLoading={updateMutation.isPending}
          disabled={updateMutation.isPending || isUploadingPhoto}
          className="h-11 px-5 text-sm font-bold shadow-lg shadow-teal-500/20 self-start sm:self-auto cursor-pointer"
          leftIcon={<Save className="w-4 h-4 text-white" />}
        >
          Salvar Alterações
        </Button>
      </div>

      {/* 1. Visual Identity & Banner / Logo Card */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-400" />
              <span>Identidade Visual & Capa</span>
            </h2>
            <p className="text-xs text-slate-400">
              Imagens em alta definição aumentam a confiança e as reservas dos clientes.
            </p>
          </div>
        </div>

        {/* Banner Area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Banner de Capa da Vitrine
          </label>

          <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner do estabelecimento"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">Nenhum banner cadastrado</span>
              </div>
            )}

            {/* Banner Upload Button Overlay */}
            <label className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
                disabled={isUploadingPhoto}
              />
              <span className="px-4 py-2 rounded-xl bg-slate-900/90 text-white font-bold text-xs border border-slate-700 shadow-xl flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-400" />
                Alterar Imagem de Capa
              </span>
            </label>

            {/* Overlaid Logo/Avatar Box */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#1E293B] border-2 border-teal-500 shadow-2xl group/logo">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo do estabelecimento"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-400 font-bold text-lg">
                    {company?.businessName?.charAt(0) || 'B'}
                  </div>
                )}

                {/* Logo Upload Trigger */}
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                  <Camera className="w-5 h-5 text-white" />
                </label>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Recomendado: 1200x400px para o banner e 400x400px para a foto de perfil/logo (JPG, PNG ou WEBP).
          </p>
        </div>

        {/* Public Storefront Link Bar */}
        <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Link Oficial da sua Vitrine Pública
            </span>
            <span className="font-mono text-teal-400 break-all font-semibold">
              {storefrontUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedLink ? 'Copiado!' : 'Copiar Link'}
            </Button>
            <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
              <Button type="button" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Abrir
              </Button>
            </a>
          </div>
        </div>
      </Card>

      {/* 2. Business Information Card */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Dados da Empresa & Atendimento</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nome do Estabelecimento"
            placeholder="Ex: Barbearia Vintage Club"
            leftIcon={<Building2 className="w-4 h-4" />}
            error={errors.businessName?.message}
            {...register('businessName')}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Tipo de Estabelecimento
            </label>
            <select
              className="w-full h-11 px-3.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              {...register('providerType')}
            >
              <option value="Barbearia">Barbearia</option>
              <option value="Salão de Beleza">Salão de Beleza</option>
              <option value="Esmalteria">Esmalteria</option>
              <option value="Estética & Spa">Estética & Spa</option>
              <option value="Estúdio de Tatuagem">Estúdio de Tatuagem</option>
            </select>
          </div>

          <Input
            label="WhatsApp Comercial (Com DDD)"
            placeholder="Ex: 11999998888"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />

          <Input
            label="Cadeiras / Atendentes Simultâneos"
            type="number"
            min="1"
            max="50"
            leftIcon={<Users className="w-4 h-4" />}
            error={errors.chairsCount?.message}
            {...register('chairsCount')}
          />
        </div>
      </Card>

      {/* 3. Address & Location Card */}
      <Card className="p-6 bg-[#0F172A] border-slate-800 space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Localização & Endereço</span>
          </h2>
          <p className="text-xs text-slate-400">
            Digite o CEP para preencher o endereço automaticamente via BrasilAPI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="CEP (com autopreenchimento)"
            placeholder="Ex: 01310100"
            maxLength={9}
            error={errors.zipCode?.message}
            {...register('zipCode', { onBlur: handleCepBlur })}
          />

          <div className="sm:col-span-2">
            <Input
              label="Logradouro / Rua"
              placeholder="Ex: Avenida Paulista"
              error={errors.street?.message}
              {...register('street')}
            />
          </div>

          <Input
            label="Número"
            placeholder="Ex: 1000"
            error={errors.number?.message}
            {...register('number')}
          />

          <Input
            label="Bairro"
            placeholder="Ex: Bela Vista"
            error={errors.district?.message}
            {...register('district')}
          />

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Input
                label="Cidade"
                placeholder="Ex: São Paulo"
                error={errors.city?.message}
                {...register('city')}
              />
            </div>
            <div>
              <Input
                label="UF"
                placeholder="SP"
                maxLength={2}
                error={errors.state?.message}
                {...register('state')}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Save Bar */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          isLoading={updateMutation.isPending}
          disabled={updateMutation.isPending || isUploadingPhoto}
          className="h-12 px-8 text-sm font-bold shadow-xl shadow-teal-500/25 cursor-pointer"
          leftIcon={<Save className="w-4 h-4 text-white" />}
        >
          Salvar Configurações
        </Button>
      </div>
    </form>
  );
};
