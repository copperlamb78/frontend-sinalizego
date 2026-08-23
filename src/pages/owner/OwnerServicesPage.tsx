import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/services/services.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import {
  Scissors,
  Plus,
  Layers,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  FolderPlus,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ServiceGroup, CompanyService } from '@/types/company.types';

export const OwnerServicesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
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

  // Form states - Group
  const [groupName, setGroupName] = useState('');
  const [groupCapacity, setGroupCapacity] = useState<number>(3);

  // 1. Fetch Service Groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ['service-groups'],
    queryFn: () => servicesService.getServiceGroups()
  });

  // 2. Service Mutations
  const saveServiceMutation = useMutation({
    mutationFn: async () => {
      const price = parseFloat(svcPrice.replace(',', '.')) || 0;
      if (editingService) {
        return servicesService.updateService(editingService.id, {
          name: svcName,
          description: svcDescription,
          durationMinutes: svcDuration,
          totalPrice: price,
          downPaymentPercent: svcDownPaymentPercent,
          serviceGroupId: svcGroupId
        });
      }
      return servicesService.createService({
        name: svcName,
        description: svcDescription,
        durationMinutes: svcDuration,
        totalPrice: price,
        downPaymentPercent: svcDownPaymentPercent,
        serviceGroupId: svcGroupId || groups?.[0]?.id || 'grp-default'
      });
    },
    onSuccess: () => {
      toast.success(editingService ? 'Serviço atualizado com sucesso!' : 'Serviço cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
      setIsServiceModalOpen(false);
      resetServiceForm();
    },
    onError: () => toast.error('Não foi possível salvar o serviço.')
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

  // 3. Group Mutations
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
      toast.success(editingGroup ? 'Categoria atualizada!' : 'Categoria criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
      setIsGroupModalOpen(false);
      setGroupName('');
      setEditingGroup(null);
    },
    onError: () => toast.error('Não foi possível salvar a categoria.')
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => servicesService.deleteServiceGroup(id),
    onSuccess: () => {
      toast.success('Categoria removida com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['service-groups'] });
    },
    onError: () => toast.error('Não foi possível excluir a categoria.')
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

  const handleOpenEditService = (service: CompanyService, groupId: string) => {
    setEditingService(service);
    setSvcName(service.name);
    setSvcDescription(service.description || '');
    setSvcDuration(service.durationMinutes);
    setSvcPrice(service.totalPrice.toString());
    setSvcDownPaymentPercent(service.downPaymentPercent);
    setSvcGroupId(groupId);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditGroup = (group: ServiceGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupCapacity(group.capacity || 3);
    setIsGroupModalOpen(true);
  };

  // Calculations for live Safety Gate check
  const numericPrice = parseFloat(svcPrice.replace(',', '.')) || 0;
  const isMicroTransaction = numericPrice < 15.0;
  const calculatedDeposit = isMicroTransaction
    ? numericPrice
    : (numericPrice * svcDownPaymentPercent) / 100;
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
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Scissors className="w-6 h-6 text-teal-400" />
            <span>Serviços & Categorias</span>
          </h1>
          <p className="text-xs text-slate-400">
            Gerencie o catálogo de serviços, tempo de duração e percentual de sinal de cada procedimento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingGroup(null);
              setGroupName('');
              setGroupCapacity(3);
              setIsGroupModalOpen(true);
            }}
            leftIcon={<Layers className="w-4 h-4 text-teal-400" />}
          >
            Nova Categoria
          </Button>

          <Button
            size="sm"
            onClick={() => {
              resetServiceForm();
              setIsServiceModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Serviço
          </Button>
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
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{group.name}</span>
                      <Badge variant="neutral" size="sm">
                        {group.services.length} {group.services.length === 1 ? 'serviço' : 'serviços'}
                      </Badge>
                    </h2>
                    <span className="text-[11px] text-slate-500">
                      Capacidade: {group.capacity || 3} {group.capacity === 1 ? 'atendimento simultâneo' : 'atendimentos simultâneos'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditGroup(group)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Editar Categoria"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a categoria "${group.name}"?`)) {
                        deleteGroupMutation.mutate(group.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Excluir Categoria"
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
                    const calculatedDownPayment = isBelowThreshold
                      ? svc.totalPrice
                      : (svc.totalPrice * svc.downPaymentPercent) / 100;

                    return (
                      <Card
                        key={svc.id}
                        className="p-4 bg-[#0B1120] border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-white">{svc.name}</h3>
                            <Badge variant={isBelowThreshold ? 'warning' : 'teal'} size="sm">
                              {isBelowThreshold ? 'Sinal 100% (Piso)' : `Sinal ${svc.downPaymentPercent}%`}
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
                  Nenhum serviço cadastrado nesta categoria.{' '}
                  <button
                    onClick={() => {
                      resetServiceForm();
                      setSvcGroupId(group.id);
                      setIsServiceModalOpen(true);
                    }}
                    className="text-teal-400 font-bold hover:underline ml-1"
                  >
                    Adicionar primeiro serviço
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum serviço cadastrado</h3>
            <p className="text-xs text-slate-400">
              Crie categorias e adicione os serviços oferecidos no seu estabelecimento.
            </p>
            <Button
              onClick={() => {
                setEditingGroup(null);
                setGroupName('Cortes Masculinos');
                setGroupCapacity(3);
                setIsGroupModalOpen(true);
              }}
              leftIcon={<FolderPlus className="w-4 h-4" />}
            >
              Criar Primeira Categoria
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
              Categoria / Grupo
            </label>
            <select
              value={svcGroupId}
              onChange={(e) => setSvcGroupId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#1E293B] border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {groups?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
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

          {/* Down Payment Percent Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Percentual do Sinal Pix
              </label>
              <span className="text-[11px] text-slate-500">Piso mínimo de R$ 15,00</span>
            </div>

            {isMicroTransaction ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Para serviços abaixo de R$ 15,00, o sinal é fixado em 100% no checkout.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { percent: 25, label: '25% (Piso Leve)' },
                  { percent: 50, label: '50% (Recomendado)' },
                  { percent: 100, label: '100% (Integral)' }
                ].map((opt) => (
                  <button
                    key={opt.percent}
                    type="button"
                    onClick={() => setSvcDownPaymentPercent(opt.percent)}
                    className={cn(
                      'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer select-none',
                      svcDownPaymentPercent === opt.percent
                        ? 'bg-teal-500 text-white border-teal-500 shadow-md'
                        : 'bg-[#1E293B] border-slate-700 text-slate-400 hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* Real-Time Live Calculation */}
            {numericPrice > 0 && (
              <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Sinal Online Pago no Pix:</span>
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

      {/* Modal: Category / Group Form */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={editingGroup ? 'Editar Categoria' : 'Nova Categoria'}
        description="Agrupe serviços semelhantes e defina a capacidade de atendimento"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!groupName.trim()) {
              toast.error('Informe o nome da categoria.');
              return;
            }
            saveGroupMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nome da Categoria"
            placeholder="Ex: Cortes Masculinos, Barba & Terapia, Tratamentos"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            leftIcon={<Layers className="w-4 h-4" />}
            required
          />

          <Input
            label="Capacidade de Cadeiras / Profissionais Simultâneos"
            type="number"
            min="1"
            max="30"
            placeholder="3"
            value={groupCapacity}
            onChange={(e) => setGroupCapacity(parseInt(e.target.value, 10) || 1)}
            helperText="Define quantos clientes podem agendar no mesmo horário nesta categoria."
            required
          />

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
              Salvar Categoria
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
    </div>
  );
};
