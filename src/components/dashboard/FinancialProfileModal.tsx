import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financialService } from '@/services/financial.service';
import { cepService } from '@/services/cep.service';
import { useAuth } from '@/contexts/auth.context';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DatePicker } from '@/components/common/DatePicker';
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  UserCheck,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import type { CompanyStorefront } from '@/types/company.types';

const financialProfileSchema = z
  .object({
    name: z.string().min(3, 'Nome completo do titular é obrigatório'),
    email: z.string().email('E-mail válido é obrigatório'),
    cpfCnpj: z
      .string()
      .min(11, 'CPF ou CNPJ inválido')
      .regex(/^[0-9.\-\/]+$/, 'Formato de CPF ou CNPJ inválido'),
    birthDate: z.string().optional().nullable(),
    companyType: z.enum(['MEI', 'INDIVIDUAL', 'LIMITED', 'ASSOCIATION']).optional().nullable(),
    mobilePhone: z.string().min(10, 'Celular com DDD é obrigatório'),
    incomeValue: z.coerce.number().min(100, 'Renda mensal mínima é de R$ 100,00'),
    postalCode: z.string().min(8, 'CEP é obrigatório'),
    address: z.string().min(2, 'Logradouro / Rua é obrigatório'),
    addressNumber: z.string().min(1, 'Número é obrigatório'),
    province: z.string().min(2, 'Bairro é obrigatório'),
    pixAddressKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM'], {
      required_error: 'Selecione o tipo da chave Pix'
    }),
    pixAddressKey: z.string().min(1, 'Informe sua chave Pix de recebimento')
  })
  .superRefine((data, ctx) => {
    const cleanDoc = data.cpfCnpj.replace(/\D/g, '');
    const isCnpj = cleanDoc.length > 11;
    if (isCnpj && !data.companyType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione o tipo societário da empresa (CNPJ)',
        path: ['companyType']
      });
    }
    if (!isCnpj && (!data.birthDate || data.birthDate.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Data de nascimento é obrigatória para Pessoa Física (CPF)',
        path: ['birthDate']
      });
    }
  });

type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;

interface FinancialProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: CompanyStorefront | null;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}

export const FinancialProfileModal: React.FC<FinancialProfileModalProps> = ({
  isOpen,
  onClose,
  company,
  defaultName = '',
  defaultEmail = '',
  defaultPhone = ''
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isSearchingCep, setIsSearchingCep] = useState(false);

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
      name: defaultName || user?.name || '',
      email: defaultEmail || user?.email || '',
      mobilePhone: defaultPhone || user?.phone || '',
      incomeValue: 3500,
      pixAddressKeyType: 'CPF',
      pixAddressKey: ''
    }
  });

  const rawCpfCnpj = watch('cpfCnpj') || '';
  const cleanDoc = rawCpfCnpj.replace(/\D/g, '');
  const isCnpj = cleanDoc.length > 11;
  const selectedPixType = watch('pixAddressKeyType');

  // Pre-fill initial company address data
  useEffect(() => {
    if (isOpen) {
      const initialStreet = company?.street || '';
      const initialNumber = company?.number || '';
      const initialDistrict = company?.district || '';
      const initialZip = company?.zipCode || '';

      reset({
        name: defaultName || user?.name || '',
        email: defaultEmail || user?.email || '',
        cpfCnpj: user?.cpfCnpj || '',
        mobilePhone: defaultPhone || user?.phone || '',
        incomeValue: 3500,
        postalCode: initialZip,
        address: initialStreet,
        addressNumber: initialNumber,
        province: initialDistrict,
        pixAddressKeyType: 'CPF',
        pixAddressKey: ''
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
      toast.success('Conta de recebimentos Pix ativada com sucesso! Carteira liberada.');
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
        'Não foi possível ativar a conta de recebimentos. Verifique os dados e tente novamente.'
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
      title="Ativação da Conta de Recebimentos Pix"
      description="Cadastre os dados do titular para receber os repasses dos agendamentos diretamente na sua conta bancária"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informative Banner */}
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-teal-300">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Processamento Seguro e Homologado pelo Banco Central</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Ao ativar sua conta de recebimentos, você passa a receber os sinais dos agendamentos via Pix com divisão automática de pagamentos, garantia protegida e saques semanais gratuitos toda segunda-feira.
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
                label="Nome Completo do Titular ou Razão Social"
                placeholder="Ex: Carlos Roberto da Silva ou Barbearia Silva LTDA"
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
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                error={errors.cpfCnpj?.message}
                {...register('cpfCnpj')}
              />
            </div>

            {/* Conditional: Company Type (CNPJ) vs Birth Date (CPF) */}
            {isCnpj ? (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Tipo Societário da Empresa (CNPJ)
                </label>
                <select
                  className="w-full h-11 px-3.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  {...register('companyType')}
                >
                  <option value="">Selecione o tipo de empresa</option>
                  <option value="MEI">MEI - Microempreendedor Individual</option>
                  <option value="INDIVIDUAL">EI - Empresário Individual</option>
                  <option value="LIMITED">LTDA - Sociedade Limitada</option>
                  <option value="ASSOCIATION">Associação / Sociedade Simples</option>
                </select>
                {errors.companyType && (
                  <p className="text-xs text-red-400 font-medium">{errors.companyType.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Data de Nascimento"
                      placeholder="Selecione a data de nascimento"
                      value={field.value || undefined}
                      onChange={field.onChange}
                      error={errors.birthDate?.message}
                      maxDate={new Date().toISOString().split('T')[0]}
                    />
                  )}
                />
              </div>
            )}

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
            <div className="space-y-1">
              <Input
                label="Renda / Faturamento Mensal Estimado (R$)"
                type="number"
                step="100"
                placeholder="3500"
                error={errors.incomeValue?.message}
                {...register('incomeValue')}
              />
            </div>
          </div>
        </div>

        {/* Section: Pix Key for Payouts */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-teal-400" />
            <span>Chave Pix para Recebimento dos Repasses</span>
          </h4>
          <p className="text-xs text-slate-400">
            Informe a chave Pix onde você deseja receber as transferências automáticas e saques do seu saldo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Tipo da Chave Pix
              </label>
              <select
                className="w-full h-11 px-3.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                {...register('pixAddressKeyType')}
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="PHONE">Celular</option>
                <option value="EMAIL">E-mail</option>
                <option value="RANDOM">Chave Aleatória (EVP)</option>
              </select>
              {errors.pixAddressKeyType && (
                <p className="text-xs text-red-400 font-medium">{errors.pixAddressKeyType.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Input
                label="Chave Pix"
                placeholder={
                  selectedPixType === 'CPF'
                    ? '000.000.000-00'
                    : selectedPixType === 'CNPJ'
                    ? '00.000.000/0001-00'
                    : selectedPixType === 'PHONE'
                    ? '(11) 99999-9999'
                    : selectedPixType === 'EMAIL'
                    ? 'seuemail@pix.com'
                    : 'Chave aleatória do banco'
                }
                error={errors.pixAddressKey?.message}
                {...register('pixAddressKey')}
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
            className="font-bold px-6 shadow-lg shadow-teal-500/20 cursor-pointer"
            isLoading={createMutation.isPending}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Ativar Conta de Recebimentos
          </Button>
        </div>
      </form>
    </Modal>
  );
};
