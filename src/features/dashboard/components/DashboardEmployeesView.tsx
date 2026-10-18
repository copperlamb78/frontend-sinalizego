import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Power,
  PowerOff,
  Star,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  FolderKanban,
  Scissors,
  Check,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/design-system/ui/card';
import { Badge } from '@/design-system/ui/badge';
import { Button } from '@/design-system/ui/button';
import { Input } from '@/design-system/ui/input';
import { Skeleton } from '@/design-system/ui/skeleton';
import { Modal } from '@/design-system/ui/modal';
import { ImageUpload } from '@/design-system/ui/ImageUpload';
import { dashboardService } from '../services/dashboardService';
import type {
  DashboardEmployee,
  EmployeeStats,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  CompanyServiceItem,
} from '../types';

export interface DashboardEmployeesViewProps {
  services: CompanyServiceItem[];
  companyId?: string;
}

export const DashboardEmployeesView: React.FC<DashboardEmployeesViewProps> = ({
  services,
  companyId,
}) => {
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(companyId || null);

  useEffect(() => {
    if (companyId) {
      setResolvedCompanyId(companyId);
    } else {
      dashboardService.getMyCompany()
        .then((comp) => {
          if (comp?.id) setResolvedCompanyId(comp.id);
        })
        .catch(() => {});
    }
  }, [companyId]);

  const [employees, setEmployees] = useState<DashboardEmployee[]>([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string; capacity: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<DashboardEmployee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Detalhes / Estatísticas
  const [selectedEmployeeForStats, setSelectedEmployeeForStats] = useState<DashboardEmployee | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formRoleTitle, setFormRoleTitle] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formSelectedGroupIds, setFormSelectedGroupIds] = useState<string[]>([]);
  const [formSelectedServiceIds, setFormSelectedServiceIds] = useState<string[]>([]);

  // Carrega lista de funcionários e grupos
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [empRes, groupRes] = await Promise.all([
        dashboardService.getEmployees({
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          groupId: selectedGroupId || undefined,
        }),
        dashboardService.getServiceGroups().catch(() => []),
      ]);

      setEmployees(empRes.items || []);
      setGroups(groupRes || []);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        errObj.response?.data?.message || 'Falha ao carregar funcionários.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, selectedGroupId]);

  // Busca com debounce leve
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormName('');
    setFormRoleTitle('');
    setFormEmail('');
    setFormPhone('');
    setFormPhotoUrl('');
    setFormSelectedGroupIds([]);
    setFormSelectedServiceIds([]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (emp: DashboardEmployee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormRoleTitle(emp.roleTitle || '');
    setFormEmail(emp.email || '');
    setFormPhone(emp.phone || '');
    setFormPhotoUrl(emp.photoUrl || '');
    setFormSelectedGroupIds(emp.groups?.map((g) => g.serviceGroup.id) || []);
    setFormSelectedServiceIds(emp.services?.map((s) => s.service.id) || []);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenStats = async (emp: DashboardEmployee) => {
    setSelectedEmployeeForStats(emp);
    setIsLoadingStats(true);
    setEmployeeStats(null);
    try {
      const stats = await dashboardService.getEmployeeStats(emp.id);
      setEmployeeStats(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas do funcionário', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCloseStats = () => {
    setSelectedEmployeeForStats(null);
    setEmployeeStats(null);
  };

  const handleToggleStatus = async (emp: DashboardEmployee) => {
    try {
      await dashboardService.toggleEmployeeStatus(emp.id);
      await loadData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      alert(errObj.response?.data?.message || 'Falha ao alterar status.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('O nome completo do funcionário é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        const payload: UpdateEmployeePayload = {
          name: formName.trim(),
          roleTitle: formRoleTitle.trim() || undefined,
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          photoUrl: formPhotoUrl.trim() || undefined,
          groupIds: formSelectedGroupIds,
          serviceIds: formSelectedServiceIds,
        };
        await dashboardService.updateEmployee(editingEmployee.id, payload);
      } else {
        const payload: CreateEmployeePayload = {
          name: formName.trim(),
          roleTitle: formRoleTitle.trim() || undefined,
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          photoUrl: formPhotoUrl.trim() || undefined,
          groupIds: formSelectedGroupIds,
          serviceIds: formSelectedServiceIds,
        };
        await dashboardService.createEmployee(payload);
      }

      setIsFormModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setFormError(
        errObj.response?.data?.message ||
          'Falha ao salvar dados do funcionário. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setFormSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  const toggleServiceSelection = (serviceId: string) => {
    setFormSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  };

  return (
    <div className="space-y-6" data-testid="dashboard-employees-view">
      {/* 1. Header com Título e Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Funcionários & Equipe
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Gerencie os profissionais do seu estabelecimento, vincule especialidades e acompanhe atendimentos reais.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          className="shrink-0 self-start sm:self-auto"
          data-testid="create-employee-button"
        >
          Novo Funcionário
        </Button>
      </div>

      {/* 2. Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, cargo ou e-mail..."
            className="pl-9 h-9 text-xs"
            data-testid="search-employee-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Status */}
          <div className="flex items-center rounded-md bg-surface-raised border border-border p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Ativos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Inativos
            </button>
          </div>

          {/* Filtro por Grupo */}
          {groups.length > 0 && (
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="h-9 px-3 rounded-md bg-surface border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="">Todos os Grupos</option>
              {groups.map((g) =>
                g && g.name ? (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ) : null
              )}
            </select>
          )}
        </div>
      </div>

      {/* 3. Mensagem de Erro Geral se houver */}
      {errorMessage && (
        <div className="p-3 bg-danger/10 border border-danger/30 rounded-md text-xs text-danger flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4. Lista ou Grid de Funcionários */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-surface border-border">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-text-primary">
              Nenhum funcionário encontrado
            </h3>
            <p className="text-xs text-text-muted max-w-sm">
              {searchTerm || statusFilter !== 'all' || selectedGroupId
                ? 'Tente ajustar os filtros ou termo de busca para encontrar profissionais.'
                : 'Cadastre os membros da sua equipe para que os clientes possam escolher quem realizará o atendimento.'}
            </p>
          </div>
          {!searchTerm && statusFilter === 'all' && !selectedGroupId && (
            <Button
              onClick={handleOpenCreate}
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              className="mt-2"
            >
              Cadastrar Primeiro Funcionário
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => {
            const initials = emp.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Card
                key={emp.id}
                className={`p-5 flex flex-col justify-between transition-all duration-200 border-border ${
                  emp.isActive
                    ? 'bg-surface hover:border-primary/40 shadow-xs'
                    : 'bg-surface/50 opacity-75 border-dashed'
                }`}
                data-testid={`employee-card-${emp.id}`}
              >
                <div className="space-y-4">
                  {/* Topo do Card: Avatar, Nome, Cargo e Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {emp.photoUrl ? (
                        <img
                          src={emp.photoUrl}
                          alt={emp.name}
                          className="h-11 w-11 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center border border-primary/20 shrink-0">
                          {initials}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                          {emp.name}
                        </h4>
                        <p className="text-xs text-text-muted line-clamp-1">
                          {emp.roleTitle || 'Profissional'}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={emp.isActive ? 'success' : 'neutral'}
                      className="whitespace-nowrap text-[10px]"
                    >
                      {emp.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {/* Informações de Contato */}
                  <div className="space-y-1.5 pt-1 text-xs text-text-muted">
                    {emp.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span className="truncate">{emp.phone}</span>
                      </div>
                    )}
                    {emp.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Vínculos com Grupos */}
                  {emp.groups && emp.groups.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        Categorias / Grupos
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {emp.groups.map((g, idx) => {
                          const grp = g.serviceGroup || (g as unknown as { group?: { id: string; name: string } }).group;
                          if (!grp || !grp.name) return null;
                          return (
                            <span
                              key={grp.id || idx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-raised border border-border text-text-secondary"
                            >
                              {grp.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Vínculos com Serviços Habilitados */}
                  {emp.services && emp.services.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
                        <Scissors className="h-3 w-3" />
                        Serviços Habilitados ({emp.services.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {emp.services.slice(0, 3).map((s, idx) => {
                          const svc = s.service || (s as unknown as { id: string; name: string });
                          if (!svc || !svc.name) return null;
                          return (
                            <span
                              key={svc.id || idx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 border border-primary/20 text-primary"
                            >
                              {svc.name}
                            </span>
                          );
                        })}
                        {emp.services.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium text-text-muted bg-surface-raised border border-border">
                            +{emp.services.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rodapé do Card com Ações Operacionais */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenStats(emp)}
                    className="text-xs h-8 gap-1.5 cursor-pointer"
                    data-testid={`employee-stats-button-${emp.id}`}
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    Indicadores
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleOpenEdit(emp)}
                      title="Editar funcionário"
                      className="cursor-pointer"
                      data-testid={`employee-edit-button-${emp.id}`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggleStatus(emp)}
                      title={emp.isActive ? 'Desativar funcionário' : 'Ativar funcionário'}
                      className={`cursor-pointer ${
                        emp.isActive ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'
                      }`}
                      data-testid={`employee-toggle-button-${emp.id}`}
                    >
                      {emp.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Modal Canônico de Cadastro / Edição (.modal-card) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEmployee ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}
        description="Preencha os dados e selecione as especialidades e serviços para este membro da equipe."
        size="lg"
        className="modal-card"
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col max-h-[75vh]">
          {/* Corpo rolável */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
            {formError && (
              <div className="p-3 bg-danger/10 border border-danger/30 rounded-md text-xs text-danger flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-text-primary">
                  Nome Completo <span className="text-danger">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Ana Beatriz Lima"
                  required
                  data-testid="employee-name-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Cargo / Especialidade
                </label>
                <Input
                  value={formRoleTitle}
                  onChange={(e) => setFormRoleTitle(e.target.value)}
                  placeholder="Ex: Cabeleireira, Manicure..."
                  data-testid="employee-role-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary">
                  Telefone / WhatsApp
                </label>
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  data-testid="employee-phone-input"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-text-primary">
                  E-mail de Contato
                </label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contato@exemplo.com"
                  data-testid="employee-email-input"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-border">
                <ImageUpload
                  value={formPhotoUrl}
                  onChange={(url) => setFormPhotoUrl(url)}
                  onUpload={async (file) => {
                    let targetCompanyId = resolvedCompanyId;
                    if (!targetCompanyId) {
                      const myComp = await dashboardService.getMyCompany();
                      targetCompanyId = myComp.id;
                      setResolvedCompanyId(myComp.id);
                    }
                    return dashboardService.uploadImage(targetCompanyId, 'employee', file);
                  }}
                  label="Foto de Perfil (Opcional)"
                  description="Selecione uma imagem do seu dispositivo. Armazenamento seguro via Cloudinary (máx. 5MB)."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Categorias / Grupos de Serviço */}
            {groups.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-text-primary flex items-center justify-between">
                  <span>Vincular a Grupos / Categorias</span>
                  <span className="text-[11px] font-normal text-text-muted">
                    {formSelectedGroupIds.length} selecionado(s)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {groups.map((g) => {
                    if (!g || !g.name) return null;
                    const isSelected = formSelectedGroupIds.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGroupSelection(g.id)}
                        className={`p-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-surface border-border text-text-secondary hover:border-border/80'
                        }`}
                      >
                        <span className="truncate pr-1">{g.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Serviços Habilitados */}
            {services.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-text-primary flex items-center justify-between">
                  <span>Serviços que este profissional executa</span>
                  <span className="text-[11px] font-normal text-text-muted">
                    {formSelectedServiceIds.length} selecionado(s)
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {services.map((svc) => {
                    if (!svc || !svc.name) return null;
                    const isSelected = formSelectedServiceIds.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleServiceSelection(svc.id)}
                        className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary font-medium'
                            : 'bg-surface border-border text-text-secondary hover:border-border/80'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-medium">{svc.name}</p>
                          <p className="text-[10px] text-text-muted">{svc.durationMinutes} min</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé Fixo */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 cursor-pointer"
              data-testid="submit-employee-button"
            >
              {isSubmitting ? 'Salvando...' : editingEmployee ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Modal de Detalhes e Indicadores Estatísticos */}
      {selectedEmployeeForStats && (
        <Modal
          isOpen={Boolean(selectedEmployeeForStats)}
          onClose={handleCloseStats}
          title={`Desempenho: ${selectedEmployeeForStats.name}`}
          description={selectedEmployeeForStats.roleTitle || 'Membro da equipe'}
          size="md"
          className="modal-card"
        >
          <div className="space-y-5">
            {isLoadingStats ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : employeeStats ? (
              <>
                {/* Grid de KPIs reais agregados no PostgreSQL */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 bg-surface-raised border-border flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                      Atendimentos Hoje
                    </span>
                    <span className="text-2xl font-black text-text-primary mt-2">
                      {employeeStats.completedToday ?? (employeeStats as unknown as { todayCount?: number }).todayCount ?? 0}
                    </span>
                  </Card>

                  <Card className="p-4 bg-surface-raised border-border flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      No Mês Atual
                    </span>
                    <span className="text-2xl font-black text-text-primary mt-2">
                      {employeeStats.completedMonth ?? (employeeStats as unknown as { monthCount?: number }).monthCount ?? 0}
                    </span>
                  </Card>

                  <Card className="p-4 bg-surface-raised border-border flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      Total Concluídos
                    </span>
                    <span className="text-2xl font-black text-text-primary mt-2">
                      {employeeStats.completedTotal ?? (employeeStats as unknown as { totalCount?: number }).totalCount ?? 0}
                    </span>
                  </Card>

                  <Card className="p-4 bg-surface-raised border-border flex flex-col justify-between">
                    <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                      Avaliação Média
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      {employeeStats.averageRating !== null && employeeStats.averageRating !== undefined ? (
                        <>
                          <span className="text-2xl font-black text-text-primary">
                            {employeeStats.averageRating}
                          </span>
                          <span className="text-xs text-text-muted">
                            / 5 ({employeeStats.ratingsCount ?? (employeeStats as unknown as { reviewsCount?: number }).reviewsCount ?? 0})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-text-muted italic">Sem avaliações</span>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Avaliações Recentes dos Clientes */}
                {employeeStats.recentReviews && employeeStats.recentReviews.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                      Avaliações Recentes
                    </span>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {employeeStats.recentReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-2.5 rounded-lg bg-surface border border-border text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-text-primary">
                              {rev.appointment?.client?.name || 'Cliente'}
                            </span>
                            <span className="text-warning font-bold flex items-center gap-0.5">
                              ★ {rev.employeeRating}
                            </span>
                          </div>
                          {rev.comment && (
                            <p className="text-text-secondary text-[11px] italic">
                              "{rev.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informações de Cadastro */}
                <div className="p-3 rounded-lg bg-surface border border-border text-xs space-y-1 text-text-muted">
                  <p>
                    <strong className="text-text-primary">Data de Cadastro:</strong>{' '}
                    {selectedEmployeeForStats.createdAt
                      ? new Date(selectedEmployeeForStats.createdAt).toLocaleDateString('pt-BR')
                      : 'Data não informada'}
                  </p>
                  <p>
                    <strong className="text-text-primary">Status:</strong>{' '}
                    {selectedEmployeeForStats.isActive ? 'Ativo para novos agendamentos' : 'Inativo (pausado)'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-text-muted text-center py-4">
                Nenhuma estatística disponível no momento.
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseStats}
                className="cursor-pointer"
                data-testid="close-employee-stats-button"
              >
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
