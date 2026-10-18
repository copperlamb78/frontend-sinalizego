import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Edit2,
  PowerOff,
  Power,
  Clock,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Badge } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';
import { Skeleton } from '@/design-system/ui/skeleton';
import { formatCurrency } from '@/core/formatters/currency';
import type {
  CompanyServiceItem,
  CreateServicePayload,
  UpdateServicePayload,
} from '../types';

export interface DashboardServicesViewProps {
  services: CompanyServiceItem[];
  isLoading: boolean;
  onCreateService: (payload: CreateServicePayload) => Promise<void>;
  onUpdateService: (serviceId: string, payload: UpdateServicePayload) => Promise<void>;
  onToggleActive: (serviceId: string, currentStatus: boolean) => Promise<void>;
}

export const DashboardServicesView: React.FC<DashboardServicesViewProps> = ({
  services,
  isLoading,
  onCreateService,
  onUpdateService,
  onToggleActive,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CompanyServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalPrice, setTotalPrice] = useState<number | string>(35);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(50);

  const handleOpenCreate = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(30);
    setTotalPrice(35);
    setDownPaymentPercent(50);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: CompanyServiceItem) => {
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description || '');
    setDurationMinutes(svc.durationMinutes);
    setTotalPrice(Number(svc.totalPrice));
    setDownPaymentPercent(svc.downPaymentPercent || 50);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const priceNum = Number(totalPrice);
    if (!name.trim()) {
      setErrorMessage('O nome do serviço é obrigatório.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Informe um valor válido maior que zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingService) {
        await onUpdateService(editingService.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          durationMinutes: Number(durationMinutes),
          totalPrice: priceNum,
          downPaymentPercent: Number(downPaymentPercent),
        });
      } else {
        await onCreateService({
          name: name.trim(),
          description: description.trim() || undefined,
          durationMinutes: Number(durationMinutes),
          totalPrice: priceNum,
          downPaymentPercent: Number(downPaymentPercent),
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        errObj.response?.data?.message || 'Falha ao salvar o serviço. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-text-primary tracking-tight">
            Serviços Cadastrados ({services.length})
          </h2>
          <p className="text-xs text-text-muted">
            Configure duração, preço e porcentagem de adiantamento (Sinal Pix)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Novo Serviço
        </Button>
      </div>

      {/* Grid de Serviços */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Scissors className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-text-primary mb-1">
            Nenhum serviço cadastrado ainda
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
            Cadastre os cortes, barbas e tratamentos oferecidos pelo seu estabelecimento para começar a receber agendamentos.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Cadastrar Primeiro Serviço
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => {
            const price = Number(svc.totalPrice);
            const downPayment = (price * (svc.downPaymentPercent || 50)) / 100;

            return (
              <Card
                key={svc.id}
                className={`p-5 flex flex-col justify-between border transition-all ${
                  svc.isActive
                    ? 'border-border hover:border-primary/40'
                    : 'border-border/60 bg-surface-raised/40 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-text-primary tracking-tight">
                      {svc.name}
                    </h3>
                    <Badge
                      variant={svc.isActive ? 'brand' : 'neutral'}
                      size="sm"
                    >
                      {svc.isActive ? 'Ativo' : 'Pausado'}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-muted line-clamp-2 mb-4">
                    {svc.description || 'Sem descrição cadastrada.'}
                  </p>

                  <div className="space-y-1.5 py-3 border-y border-border text-xs">
                    <div className="flex items-center justify-between text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Duração:
                      </span>
                      <span className="font-semibold text-text-primary">
                        {svc.durationMinutes} minutos
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Sinal ({svc.downPaymentPercent}%):
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(downPayment)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-semibold block">
                      Valor Total
                    </span>
                    <span className="text-lg font-black text-text-primary">
                      {formatCurrency(price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(svc)}
                      title="Editar serviço"
                      leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                    >
                      Editar
                    </Button>

                    <Button
                      variant={svc.isActive ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => onToggleActive(svc.id, svc.isActive)}
                      title={svc.isActive ? 'Pausar serviço' : 'Reativar serviço'}
                      leftIcon={
                        svc.isActive ? (
                          <PowerOff className="h-3.5 w-3.5" />
                        ) : (
                          <Power className="h-3.5 w-3.5" />
                        )
                      }
                    >
                      {svc.isActive ? 'Pausar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Canônico (.modal-card) para Criação e Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="modal-card w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header fixo shrink-0 */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Defina o valor e as regras para agendamentos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-raised cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Corpo rolável flex-1 min-h-0 */}
            <form id="service-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 text-danger text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Input
                label="Nome do Serviço"
                placeholder="Ex: Corte Masculino Degradê"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">
                  Descrição (Opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 text-xs rounded-[4px] border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px] resize-none"
                  placeholder="Ex: Inclui lavagem especial, finalização com pomada e toalha quente..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Duração em minutos"
                  type="number"
                  min="5"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  required
                />

                <Input
                  label="Valor Total (R$)"
                  type="number"
                  min="1"
                  step="0.5"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-secondary">
                  Porcentagem de Sinal (%)
                </label>
                <select
                  className="w-full h-11 px-3 text-xs rounded-[4px] border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                >
                  <option value={30}>30% (Para serviços &ge; R$ 400)</option>
                  <option value={50}>50% (Padrão automático SinalizeGO)</option>
                  <option value={100}>100% (Sinal integral)</option>
                </select>
                <p className="text-[11px] text-text-muted mt-1">
                  A disponibilidade de atendimento é calculada automaticamente a partir dos profissionais habilitados na aba <strong>Funcionários &amp; Equipe</strong>.
                </p>
              </div>
            </form>

            {/* Rodapé fixo shrink-0 */}
            <div className="p-4 border-t border-border flex items-center justify-end gap-2 shrink-0 bg-surface">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="service-form"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Check className="h-4 w-4" />}
              >
                {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
