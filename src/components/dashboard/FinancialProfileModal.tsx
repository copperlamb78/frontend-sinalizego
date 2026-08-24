import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/services/financial.service';
import { companyService } from '@/services/company.service';
import { cepService } from '@/services/cep.service';
import { useAuth } from '@/contexts/auth.context';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { DatePicker } from '@/components/common/DatePicker';
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

const financialProfileSchema = z.object({
  name: z.string().min(3, 'Nome completo do titular é obrigatório'),
  email: z.string().email('E-mail válido é obrigatório'),
  cpfCnpj: z
    .string()
    .min(11, 'CPF ou CNPJ deve ter no mínimo 11 dígitos')
    .max(18, 'CPF/CNPJ inválido'),
  birthDate: z
    .string()
    .min(10, 'Data de nascimento é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser AAAA-MM-DD')
    .refine((dateStr) => {
      const birth = new Date(dateStr);
      if (isNaN(birth.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 18 && birth <= today;
    }, 'O titular deve ter no mínimo 18 anos'),
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
  const { user } = useAuth();
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Fetch company data to extract registered address and contact
  const { data: company } = useQuery({
    queryKey: ['owner-company-profile'],
    queryFn: () => companyService.getCompanyByUserId(),
    staleTime: 1000 * 60 * 5,
    enabled: isOpen
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      mobilePhone: '',
      cpfCnpj: '',
      incomeValue: 3500,
      birthDate: '',
      postalCode: '',
      address: '',
      addressNumber: '',
      province: ''
    }
  });

  // Pre-fill form automatically from User and Company profiles when opened
  useEffect(() => {
    if (isOpen) {
      const initialName = defaultName || user?.name || company?.businessName || '';
      const initialEmail = defaultEmail || user?.email || '';
      const initialPhone = defaultPhone || user?.phone || company?.whatsapp || '';
      const initialCpfCnpj = user?.cpfCnpj || '';
      const initialZip = company?.zipCode || '';
      const initialStreet = company?.street || '';
      const initialNumber = company?.number || '';
      const initialDistrict = company?.district || '';

      reset({
        name: initialName,
        email: initialEmail,
        mobilePhone: initialPhone,
        cpfCnpj: initialCpfCnpj,
        incomeValue: 3500,
        birthDate: '',
        postalCode: initialZip,
        address: initialStreet,
        addressNumber: initialNumber,
        province: initialDistrict
      });
    }
  }, [isOpen, user, company, defaultName, defaultEmail, defaultPhone, reset]);

  const postalCodeValue = watch('postalCode');

  // Handle CEP auto-fill via BrasilAPI
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
      const message = extractErrorMessage(
        err,
        'Não foi possível criar a subconta Asaas. Verifique os dados e tente novamente.'
      );
      toast.error(message);
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

        {/* Section: Titular Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Dados do Titular da Conta</span>
          </h4>

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

            {/* Birth Date (Custom Shadcn DatePicker) */}
            <div className="space-y-1">
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de Nascimento"
                    placeholder="Selecione a data de nascimento"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.birthDate?.message}
                    maxDate={new Date().toISOString().split('T')[0]}
                  />
                )}
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
          </div>
        </div>

        {/* Section: Address */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Endereço do Titular / Estabelecimento</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
