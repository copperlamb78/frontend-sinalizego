import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/services/financial.service';
import { cepService } from '@/services/cep.service';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
  ShieldCheck,
  Building2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const financialProfileSchema = z.object({
  name: z.string().min(3, 'Nome completo do titular é obrigatório'),
  email: z.string().email('E-mail válido é obrigatório'),
  cpfCnpj: z
    .string()
    .min(11, 'CPF ou CNPJ deve ter no mínimo 11 dígitos')
    .max(18, 'CPF/CNPJ inválido'),
  birthDate: z
    .string()
    .min(10, 'Data de nascimento obrigatória (AAAA-MM-DD)')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser AAAA-MM-DD'),
  mobilePhone: z.string().min(10, 'Celular com DDD é obrigatório'),
  incomeValue: z.coerce.number().min(100, 'Renda mensal mínima é de R$ 100,00'),
  postalCode: z.string().min(8, 'CEP é obrigatório'),
  address: z.string().min(2, 'Logradouro / Rua é obrigatório'),
  addressNumber: z.string().min(1, 'Número é obrigatório'),
  province: z.string().min(2, 'Bairro é obrigatório')
});

type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;

interface FinancialProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}

export const FinancialProfileModal: React.FC<FinancialProfileModalProps> = ({
  isOpen,
  onClose,
  defaultName = '',
  defaultEmail = '',
  defaultPhone = ''
}) => {
  const queryClient = useQueryClient();
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      mobilePhone: defaultPhone,
      incomeValue: 3500,
      birthDate: '1995-01-01'
    }
  });

  const postalCodeValue = watch('postalCode');

  // Handle CEP auto-fill
  const handleCepBlur = async () => {
    const rawCep = postalCodeValue?.replace(/\D/g, '');
    if (rawCep && rawCep.length === 8) {
      setIsSearchingCep(true);
      try {
        const addressData = await cepService.fetchAddressByCep(rawCep);
        if (addressData) {
          setValue('address', addressData.street || '');
          setValue('province', addressData.neighborhood || '');
        }
      } catch {
        // ignore
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: FinancialProfileFormData) => financialService.createFinancialProfile(data),
    onSuccess: () => {
      toast.success('Subconta Asaas ativada com sucesso! Carteira liberada.');
      queryClient.invalidateQueries({ queryKey: ['owner-company-profile'] });
      queryClient.invalidateQueries({ queryKey: ['company-balance'] });
      queryClient.invalidateQueries({ queryKey: ['company-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message ||
        'Não foi possível criar a subconta Asaas. Verifique os dados e tente novamente.';
      const formatted = Array.isArray(message) ? message.join(', ') : message;
      toast.error(formatted);
    }
  });

  const onSubmit = (data: FinancialProfileFormData) => {
    createMutation.mutate({
      ...data,
      cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
      mobilePhone: data.mobilePhone.replace(/\D/g, ''),
      postalCode: data.postalCode.replace(/\D/g, '')
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ativação da Subconta Bancária Asaas"
      description="Cadastre os dados do titular para receber os pagamentos Pix diretamente na sua conta"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informative Banner */}
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Processamento Seguro e Homologado pelo Banco Central (Asaas)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Ao ativar sua subconta, você passa a receber os sinais dos agendamentos via Pix com split automático, custódia protegida e saques semanais automáticos gratuitos toda segunda-feira.
          </p>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Titular Name */}
          <div className="sm:col-span-2 space-y-1">
            <Input
              label="Nome Completo do Titular"
              placeholder="Ex: Carlos Roberto da Silva"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Input
              label="E-mail de Notificação"
              type="email"
              placeholder="seuemail@exemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* CPF / CNPJ */}
          <div className="space-y-1">
            <Input
              label="CPF ou CNPJ do Titular"
              placeholder="000.000.000-00"
              error={errors.cpfCnpj?.message}
              {...register('cpfCnpj')}
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-1">
            <Input
              label="Data de Nascimento"
              type="date"
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />
          </div>

          {/* Mobile Phone */}
          <div className="space-y-1">
            <Input
              label="Celular com DDD"
              placeholder="Ex: 75999998888"
              error={errors.mobilePhone?.message}
              {...register('mobilePhone')}
            />
          </div>

          {/* Income Value */}
          <div className="sm:col-span-2 space-y-1">
            <Input
              label="Renda Mensal Estimada (R$)"
              type="number"
              step="100"
              placeholder="3500"
              error={errors.incomeValue?.message}
              {...register('incomeValue')}
            />
          </div>

          {/* Address Section */}
          <div className="sm:col-span-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Endereço do Titular / Estabelecimento</span>
            </h4>
          </div>

          {/* Postal Code (CEP) */}
          <div className="space-y-1">
            <Input
              label="CEP"
              placeholder="44000-000"
              error={errors.postalCode?.message}
              {...register('postalCode')}
              onBlur={handleCepBlur}
            />
            {isSearchingCep && (
              <span className="text-[10px] text-teal-400 animate-pulse block">Buscando CEP...</span>
            )}
          </div>

          {/* Province / Bairro */}
          <div className="space-y-1">
            <Input
              label="Bairro"
              placeholder="Centro"
              error={errors.province?.message}
              {...register('province')}
            />
          </div>

          {/* Street */}
          <div className="space-y-1">
            <Input
              label="Logradouro / Rua"
              placeholder="Av. Getúlio Vargas"
              error={errors.address?.message}
              {...register('address')}
            />
          </div>

          {/* Number */}
          <div className="space-y-1">
            <Input
              label="Número"
              placeholder="123"
              error={errors.addressNumber?.message}
              {...register('addressNumber')}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            size="md"
            className="font-bold px-6 shadow-lg shadow-teal-500/20"
            isLoading={createMutation.isPending}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Ativar Subconta Asaas
          </Button>
        </div>
      </form>
    </Modal>
  );
};
