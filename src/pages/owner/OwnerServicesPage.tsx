import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/services/services.service';
import { companyService } from '@/services/company.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { FinancialProfileModal } from '@/components/dashboard/FinancialProfileModal';
import {
  Scissors,
  Plus,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  FolderPlus,
  ShieldCheck,
  Users,
  Info,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ServiceGroup, CompanyService } from '@/types/company.types';

export const OwnerServicesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CompanyService | null>(null);
  const [editingGroup, setEditingGroup] = useState<ServiceGroup | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<CompanyService | null>(null);

  // Form states - Service
  const [svcName, setSvcName] = useState('');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcDuration, setSvcDuration] = useState<number>(30);
  const [svcPrice, setSvcPrice] = useState<string>('45.00');
  const [svcDownPaymentPercent, setSvcDownPaymentPercent] = useState<number>(50);
  const [svcGroupId, setSvcGroupId] = useState<string>('');

  // Form states - Group / Chair
  const [groupName, setGroupName] = useState('');
  const [groupCapacity, setGroupCapacity] = useState<number>(1);

  // 1. Fetch Company Profile (to verify subaccount)
  const { data: company } = useQuery({
    queryKey: ['owner-company-profile'],
    queryFn: () => companyService.getCompanyByUserId(),
    staleTime: 1000 * 60 * 5
  });

  const hasSubaccount = Boolean(
    company?.walletId ||
      company?.financialProfile?.walletId ||
      company?.financialProfile?.status === 'APPROVED' ||
      company?.financialProfile?.status === 'ACTIVE'
  );

  // 2. Fetch Service Groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ['service-groups'],
    queryFn: () => servicesService.getServiceGroups()
  });

  // 3. Service Mutations
  const saveServiceMutation = useMutation({
    mutationFn: async () => {
      if (!hasSubaccount) {
        throw new Error('É necessário ativar a subconta Asaas antes de cadastrar serviços.');
      }
      const price = parseFloat(svcPrice.replace(',', '.')) || 0;
      
      // Calculate final deposit percentage based on price rules
      let finalDownPayment = 50;
      if (price < 15.0) {
        finalDownPayment = 100;
      } else if (price >= 400.0) {
        finalDownPayment = svcDownPaymentPercent === 30 ? 30 : 50;
      } else {
        finalDownPayment = 50;
      }

      if (editingService) {
        return servicesService.updateService(editingService.id, {
          name: svcName,
          description: svcDescription,
          durationMinutes: svcDuration,
          totalPrice: price,
          downPaymentPercent: finalDownPayment,
          depositPercentage: finalDownPayment,
          serviceGroupId: svcGroupId
        });
      }
      return servicesService.createService({
        name: svcName,
        description: svcDescription,
        durationMinutes: svcDuration,
        totalPrice: price,
        downPaymentPercent: finalDownPayment,
        depositPercentage: finalDownPayment,
        serviceGroupId: svcGroupId || groups?.[0]?.id || 'grp-default'
      });
    },
    onSuccess: () => {
      toast.success(editingService ? 'Serviço atualizado com sucesso!' : 'Serviço cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
      setIsServiceModalOpen(false);
      resetServiceForm();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Não foi possível salvar o serviço.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => servicesService.deleteService(id),
    onSuccess: () => {
      toast.success('Serviço removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
      setServiceToDelete(null);
    },
    onError: () => toast.error('Não foi possível excluir o serviço.')
  });

  // 4. Group Mutations
  const saveGroupMutation = useMutation({
    mutationFn: async () => {
      if (editingGroup) {
        return servicesService.updateServiceGroup(editingGroup.id, {
          name: groupName,
          capacity: groupCapacity
        });
      }
      return servicesService.createServiceGroup({
        name: groupName,
        capacity: groupCapacity
      });
    },
    onSuccess: () => {
      toast.success(editingGroup ? 'Cadeira/Equipe atualizada!' : 'Cadeira/Equipe criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
      setIsGroupModalOpen(false);
      setGroupName('');
      setEditingGroup(null);
    },
    onError: () => toast.error('Não foi possível salvar.')
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => servicesService.deleteServiceGroup(id),
    onSuccess: () => {
      toast.success('Cadeira/Equipe removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
    },
    onError: () => toast.error('Não foi possível excluir.')
  });

  const resetServiceForm = () => {
    setEditingService(null);
    setSvcName('');
    setSvcDescription('');
    setSvcDuration(30);
    setSvcPrice('45.00');
    setSvcDownPaymentPercent(50);
    setSvcGroupId(groups?.[0]?.id || '');
  };

  const handleOpenCreateService = () => {
    if (!hasSubaccount) {
      toast.info('Ative sua subconta Asaas para desbloquear o cadastro de serviços com sinal online.');
      setIsFinancialModalOpen(true);
      return;
    }
    resetServiceForm();
    setIsServiceModalOpen(true);
  };

  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupCapacity(1);
    setIsGroupModalOpen(true);
  };

  const handleOpenEditService = (service: CompanyService, groupId: string) => {
    setEditingService(service);
    setSvcName(service.name);
    setSvcDescription(service.description || '');
    setSvcDuration(service.durationMinutes);
    setSvcPrice(service.totalPrice.toString());
    const pct = service.downPaymentPercent || service.depositPercentage || 50;
    setSvcDownPaymentPercent(service.totalPrice >= 400 && pct === 30 ? 30 : 50);
    setSvcGroupId(groupId);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditGroup = (group: ServiceGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupCapacity(group.capacity || 1);
    setIsGroupModalOpen(true);
  };

  // Calculations for live Safety Gate & High Ticket check
  const numericPrice = parseFloat(svcPrice.replace(',', '.')) || 0;
  const isMicroTransaction = numericPrice < 15.0;
  const isHighTicket = numericPrice >= 400.0;
  const effectiveDownPaymentPercent = isMicroTransaction
    ? 100
    : isHighTicket
    ? (svcDownPaymentPercent === 30 ? 30 : 50)
    : 50;
  const calculatedDeposit = (numericPrice * effectiveDownPaymentPercent) / 100;
  const remainingInSalon = Math.max(0, numericPrice - calculatedDeposit);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Scissors className="w-6 h-6 text-teal-400" />
              <span>Serviços & Cadeiras de Atendimento</span>
            </h1>
            <Badge variant={hasSubaccount ? 'teal' : 'warning'} size="sm">
              {hasSubaccount ? 'Catálogo Liberado' : 'Subconta Pendente'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Organize suas cadeiras/profissionais, catálogo de procedimentos, tempo de duração e regras de sinal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateGroup}
            leftIcon={<Users className="w-4 h-4 text-teal-400" />}
          >
            Nova Cadeira / Equipe
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreateService}
            leftIcon={hasSubaccount ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            className={!hasSubaccount ? 'opacity-80' : ''}
          >
            Novo Serviço
          </Button>
        </div>
      </div>

      {/* Warning Gate: Subconta Pendente */}
      {!hasSubaccount && (
        <Card className="p-5 bg-gradient-to-r from-amber-500/10 via-[#1E293B] to-[#0F172A] border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <h3 className="font-bold text-white">
                Cadastro de Serviços Bloqueado — Subconta Asaas Pendente
              </h3>
              <p className="text-slate-300">
                Para cadastrar serviços com sinal Pix online e definir taxas de garantia de horário, complete o cadastro da sua subconta Asaas.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsFinancialModalOpen(true)}
            className="shrink-0 font-bold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Ativar Subconta
          </Button>
        </Card>
      )}

      {/* Educational Best Practices Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-[#0F172A] to-teal-950/40 border border-teal-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-teal-400 font-bold">
          <Users className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Como organizar suas agendas e evitar superlotação (overbooking):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 text-[11px] pt-1">
          <div className="p-3 rounded-xl bg-[#0B1120]/90 border border-slate-800 space-y-1">
            <span className="font-bold text-teal-300 block">Por Profissional (Recomendado):</span>
            <p className="text-slate-400 leading-relaxed">
              Crie um grupo para cada barbeiro/cadeira com <strong>capacidade = 1</strong> e vincule os serviços que ele realiza.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#0B1120]/90 border border-slate-800 space-y-1">
            <span className="font-bold text-teal-300 block">Equipe Compartilhada:</span>
            <p className="text-slate-400 leading-relaxed">
              Se todos fazem os mesmos serviços, crie um único grupo (ex: <em>"Barbearia Geral"</em>) com a <strong>capacidade igual ao número total de cadeiras ativas</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Zero Trust Safety Gate Banner */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
        <span>
          <strong>Regra de Proteção Financeira:</strong> Serviços com preço total inferior a R$ 15,00 têm cobrança de sinal integral (100%) no checkout para cumprir o piso de microtransações do gateway.
        </span>
      </div>

      {/* Service Groups Hierarchy */}
      <div className="space-y-6">
        {groups && groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.id} className="space-y-3">
              {/* Group Header Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">
                        {group.name}
                      </h2>
                      <Badge variant="teal" size="sm">
                        {group.capacity === 1 ? '1 Cadeira / Profissional' : `${group.capacity} Vagas Simultâneas`}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {group.services.length} {group.services.length === 1 ? 'serviço' : 'serviços'}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-500 block pt-0.5">
                      Capacidade de atendimento: {group.capacity} {group.capacity === 1 ? 'cliente por horário' : 'clientes simultâneos por horário'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditGroup(group)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar Cadeira / Equipe"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a cadeira/equipe "${group.name}"?`)) {
                        deleteGroupMutation.mutate(group.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Excluir Cadeira / Equipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Group Services Grid */}
              {group.services && group.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 sm:pl-4">
                  {group.services.map((svc) => {
                    const isBelowThreshold = svc.totalPrice < 15.0;
                    const pct = isBelowThreshold
                      ? 100
                      : svc.downPaymentPercent || svc.depositPercentage || 50;
                    const calculatedDownPayment = (svc.totalPrice * pct) / 100;

                    return (
                      <Card
                        key={svc.id}
                        className="p-4 bg-[#0B1120] border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-white">{svc.name}</h3>
                            <Badge variant={isBelowThreshold ? 'warning' : pct === 30 ? 'teal' : 'neutral'} size="sm">
                              {isBelowThreshold
                                ? 'Sinal 100% (Piso)'
                                : pct === 30
                                ? 'Sinal 30% (Flex)'
                                : `Sinal ${pct}%`}
                            </Badge>
                          </div>

                          {svc.description && (
                            <p className="text-xs text-slate-400 line-clamp-2">{svc.description}</p>
                          )}
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-teal-400" />
                              {svc.durationMinutes} minutos
                            </span>

                            <div className="text-right">
                              <span className="font-black text-white text-sm">
                                {formatCurrency(svc.totalPrice)}
                              </span>
                              <span className="block text-[10px] text-teal-400 font-semibold">
                                Sinal Pix: {formatCurrency(calculatedDownPayment)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-3"
                              onClick={() => handleOpenEditService(svc, group.id)}
                              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                            >
                              Editar
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-8 px-2 text-slate-400 hover:text-red-400"
                              onClick={() => setServiceToDelete(svc)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-[#0B1120] border border-slate-800 rounded-2xl text-xs text-slate-500">
                  Nenhum serviço cadastrado nesta cadeira/equipe.{' '}
                  <button
                    onClick={() => {
                      resetServiceForm();
                      setSvcGroupId(group.id);
                      setIsServiceModalOpen(true);
                    }}
                    className="text-teal-400 font-bold hover:underline ml-1 cursor-pointer"
                  >
                    Adicionar primeiro serviço
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhuma cadeira/equipe cadastrada</h3>
            <p className="text-xs text-slate-400">
              Crie suas cadeiras ou grupos de atendimento para vincular os serviços oferecidos.
            </p>
            <Button
              onClick={() => {
                setEditingGroup(null);
                setGroupName('Cadeira 01 - Carlos');
                setGroupCapacity(1);
                setIsGroupModalOpen(true);
              }}
              leftIcon={<FolderPlus className="w-4 h-4" />}
            >
              Criar Primeira Cadeira / Equipe
            </Button>
          </div>
        )}
      </div>

      {/* Modal: Service Form */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        description="Configure os detalhes, tempo de duração e sinal de reserva"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!svcName.trim()) {
              toast.error('Informe o nome do serviço.');
              return;
            }
            saveServiceMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nome do Serviço"
            placeholder="Ex: Corte Degradê / Fade Master"
            value={svcName}
            onChange={(e) => setSvcName(e.target.value)}
            leftIcon={<Scissors className="w-4 h-4" />}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Cadeira / Equipe Responsável
            </label>
            <select
              value={svcGroupId}
              onChange={(e) => setSvcGroupId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {groups?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.capacity === 1 ? '1 cadeira/vaga' : `${g.capacity} vagas simultâneas`})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Descrição do Serviço (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Lavagem com shampoo especial, corte fade com máquina e acabamento na navalha."
              value={svcDescription}
              onChange={(e) => setSvcDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Tempo de Duração (Minutos)
              </label>
              <select
                value={svcDuration}
                onChange={(e) => setSvcDuration(parseInt(e.target.value, 10))}
                className="w-full h-11 px-3.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value={15}>15 minutos (Rápido / Acabamento)</option>
                <option value={30}>30 minutos (Padrão)</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (1 hora)</option>
                <option value={90}>90 minutos (1h30)</option>
                <option value={120}>120 minutos (2 horas)</option>
              </select>
            </div>

            <Input
              label="Preço Total do Serviço (R$)"
              type="number"
              step="0.01"
              min="1"
              placeholder="45.00"
              value={svcPrice}
              onChange={(e) => setSvcPrice(e.target.value)}
              required
            />
          </div>

          {/* Down Payment Rules & High Ticket Flex */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Regra de Sinal de Reserva (Pix)
              </label>
              <span className="text-[11px] text-slate-500">
                {isMicroTransaction
                  ? 'Piso micro-transação'
                  : isHighTicket
                  ? 'Alto Ticket'
                  : 'Padrão 50%'}
              </span>
            </div>

            {isMicroTransaction ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Para serviços abaixo de R$ 15,00, o sinal é fixado em 100% no checkout conforme a política de segurança financeira.
                </span>
              </div>
            ) : isHighTicket ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-[#1E293B] to-[#0F172A] border border-teal-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-black text-white">
                      Condição Especial para Serviços de Alto Ticket
                    </span>
                  </div>
                  <Badge variant="teal" size="sm">FLEXÍVEL</Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Para serviços a partir de R$ 400,00, você pode flexibilizar o sinal para 30% para acelerar as reservas com seus clientes.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSvcDownPaymentPercent(50)}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer select-none',
                      effectiveDownPaymentPercent === 50
                        ? 'bg-teal-500/20 border-teal-500 text-white shadow-md ring-1 ring-teal-500'
                        : 'bg-[#0B1120] border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">50% de Sinal (Padrão)</span>
                      <span className="text-xs text-teal-400 font-extrabold">
                        {formatCurrency((numericPrice * 50) / 100)}
                      </span>
                    </div>
                    {effectiveDownPaymentPercent === 50 && (
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSvcDownPaymentPercent(30)}
                    className={cn(
                      'p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer select-none',
                      effectiveDownPaymentPercent === 30
                        ? 'bg-teal-500/20 border-teal-500 text-white shadow-md ring-1 ring-teal-500'
                        : 'bg-[#0B1120] border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">30% de Sinal (Flexível)</span>
                      <span className="text-xs text-teal-400 font-extrabold">
                        {formatCurrency((numericPrice * 30) / 100)}
                      </span>
                    </div>
                    {effectiveDownPaymentPercent === 30 && (
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#1E293B] border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Sinal de Reserva Padrão (50%)</span>
                <span className="font-bold text-teal-400">{formatCurrency(calculatedDeposit)}</span>
              </div>
            )}

            {/* Real-Time Live Calculation */}
            {numericPrice > 0 && (
              <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Sinal Online Pago no Pix ({effectiveDownPaymentPercent}%):</span>
                  <span className="font-bold text-teal-400 text-sm">
                    {formatCurrency(calculatedDeposit)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Restante a Pagar no Balcão:</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(remainingInSalon)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsServiceModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={saveServiceMutation.isPending}
            >
              Salvar Serviço
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Chair / Group Form */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={editingGroup ? 'Editar Cadeira / Equipe' : 'Nova Cadeira / Equipe de Atendimento'}
        description="Defina quem realiza os serviços e a quantidade de atendimentos simultâneos para evitar overbooking."
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!groupName.trim()) {
              toast.error('Informe o nome da cadeira ou profissional.');
              return;
            }
            saveGroupMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nome da Cadeira, Profissional ou Equipe"
            placeholder="Ex: Cadeira Principal / Carlos, Manicures, Todos os Barbeiros"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            leftIcon={<Users className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5">
            <Input
              label="Quantidade de Profissionais / Vagas Simultâneas"
              type="number"
              min="1"
              max="30"
              placeholder="1"
              value={groupCapacity}
              onChange={(e) => setGroupCapacity(parseInt(e.target.value, 10) || 1)}
              required
            />
            <p className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed bg-[#0B1120] p-2.5 rounded-xl border border-slate-800">
              <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Quantos clientes podem ser atendidos ao mesmo tempo nos serviços deste grupo? Se cada profissional atende individualmente, mantenha <strong>1</strong>.
              </span>
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGroupModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={saveGroupMutation.isPending}
            >
              Salvar Cadeira / Equipe
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Service Confirmation */}
      {serviceToDelete && (
        <Modal
          isOpen={!!serviceToDelete}
          onClose={() => setServiceToDelete(null)}
          title="Excluir Serviço"
          description={`Tem certeza que deseja remover "${serviceToDelete.name}"?`}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Esta ação removerá o serviço da sua vitrine pública. Agendamentos futuros já confirmados para este serviço não serão afetados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServiceToDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={deleteServiceMutation.isPending}
                onClick={() => deleteServiceMutation.mutate(serviceToDelete.id)}
              >
                Excluir Serviço
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Ativação da Subconta */}
      <FinancialProfileModal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        defaultName={company?.businessName}
        defaultPhone={company?.whatsapp}
      />
    </div>
  );
};
