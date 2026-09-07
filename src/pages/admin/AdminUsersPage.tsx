import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Power,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  User,
  Plus,
  KeyRound,
  FileSearch,
  Pencil,
  Shield,
  Building2,
  Calendar,
  Sparkles,
  Mail,
  Phone,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type {
  AdminUserItem,
  CreateUserByAdminData,
  UpdateUserByAdminData,
  AdminUserAudit
} from '@/types/admin.types';
import { Role } from '@/types/auth.types';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Role Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals state
  const [userToBlock, setUserToBlock] = useState<AdminUserItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUserItem | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<AdminUserItem | null>(null);
  const [userAuditId, setUserAuditId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Form states - Create User
  const [createForm, setCreateForm] = useState<CreateUserByAdminData>({
    name: '',
    email: '',
    phone: '',
    role: Role.CLIENT,
    password: '',
    sendEmail: true
  });
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  // Form states - Edit User
  const [editForm, setEditForm] = useState<UpdateUserByAdminData>({
    name: '',
    email: '',
    phone: '',
    role: Role.CLIENT,
    isActive: true
  });

  // Success / Feedback notification
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Queries
  const { data: users = [], isLoading } = useQuery<AdminUserItem[]>({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers
  });

  // User Audit Query
  const { data: auditData, isLoading: isLoadingAudit } = useQuery<AdminUserAudit>({
    queryKey: ['admin-user-audit', userAuditId],
    queryFn: () => adminService.getUserAudit(userAuditId!),
    enabled: !!userAuditId
  });

  // Mutations
  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => adminService.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToBlock(null);
      toast.success('Usuário suspenso com sucesso.');
      setFeedbackMessage('Usuário suspenso com sucesso.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err: any) => {
      const msg = extractErrorMessage(err, 'Não foi possível suspender o usuário.');
      toast.error(msg);
    }
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => adminService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário reativado com sucesso.');
      setFeedbackMessage('Usuário reativado com sucesso.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err: any) => {
      const msg = extractErrorMessage(err, 'Não foi possível reativar o usuário.');
      toast.error(msg);
    }
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserByAdminData) => adminService.createUser(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateModalOpen(false);
      setCreateError(null);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        role: Role.CLIENT,
        password: '',
        sendEmail: true
      });
      setAutoGeneratePassword(true);
      const successMsg = res.temporaryPasswordGenerated
        ? 'Usuário criado! Uma senha temporária foi enviada por e-mail com troca obrigatória no 1º acesso.'
        : 'Usuário cadastrado com sucesso.';
      toast.success(successMsg);
      setFeedbackMessage(successMsg);
      setTimeout(() => setFeedbackMessage(null), 6000);
    },
    onError: (err: any) => {
      const msg = extractErrorMessage(err, 'Não foi possível cadastrar o usuário.');
      setCreateError(msg);
      toast.error(msg);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserByAdminData }) =>
      adminService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToEdit(null);
      setEditError(null);
      toast.success('Dados do usuário atualizados com sucesso.');
      setFeedbackMessage('Dados do usuário atualizados com sucesso.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    },
    onError: (err: any) => {
      const msg = extractErrorMessage(err, 'Não foi possível atualizar o usuário.');
      setEditError(msg);
      toast.error(msg);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminService.resetUserPassword(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToResetPassword(null);
      const successMsg = `Senha redefinida com sucesso! Uma nova senha temporária foi enviada para ${res.email}.`;
      toast.success(successMsg);
      setFeedbackMessage(successMsg);
      setTimeout(() => setFeedbackMessage(null), 6000);
    },
    onError: (err: any) => {
      const msg = extractErrorMessage(err, 'Não foi possível redefinir a senha do usuário.');
      toast.error(msg);
    }
  });

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Role Filter Options with live counts and Lucide icons
  const roleFilterOptions = useMemo(() => [
    {
      value: 'ALL',
      label: 'Todos os Perfis',
      count: users.length,
      icon: <Users className="w-4 h-4" />
    },
    {
      value: Role.CLIENT,
      label: 'Clientes',
      count: users.filter((u) => u.role === Role.CLIENT).length,
      icon: <User className="w-4 h-4" />
    },
    {
      value: Role.COMPANY_OWNER,
      label: 'Proprietários de Empresa',
      count: users.filter((u) => u.role === Role.COMPANY_OWNER).length,
      icon: <Building2 className="w-4 h-4" />
    },
    {
      value: Role.PROVIDER,
      label: 'Prestadores',
      count: users.filter((u) => u.role === Role.PROVIDER).length,
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      value: Role.EMPLOYEE,
      label: 'Funcionários',
      count: users.filter((u) => u.role === Role.EMPLOYEE).length,
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      value: Role.ADMIN,
      label: 'Administradores',
      count: users.filter((u) => u.role === Role.ADMIN).length,
      icon: <Shield className="w-4 h-4" />
    },
    {
      value: Role.SUPER_ADMIN,
      label: 'Super Admins',
      count: users.filter((u) => u.role === Role.SUPER_ADMIN).length,
      icon: <ShieldAlert className="w-4 h-4" />
    }
  ], [users]);

  // Role Badge Helper
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return (
          <Badge variant="purple" size="sm" className="font-bold flex items-center gap-1 w-fit mx-auto">
            <Shield className="w-3 h-3 text-purple-300" />
            SUPER ADMIN
          </Badge>
        );
      case Role.ADMIN:
        return (
          <Badge variant="indigo" size="sm" className="font-bold w-fit mx-auto">
            ADMIN
          </Badge>
        );
      case Role.COMPANY_OWNER:
        return (
          <Badge variant="teal" size="sm" className="font-bold flex items-center gap-1 w-fit mx-auto">
            <Building2 className="w-3 h-3" />
            PROPRIETÁRIO
          </Badge>
        );
      case Role.PROVIDER:
        return (
          <Badge variant="sky" size="sm" className="font-bold w-fit mx-auto">
            PRESTADOR
          </Badge>
        );
      case Role.EMPLOYEE:
        return (
          <Badge variant="secondary" size="sm" className="w-fit mx-auto text-slate-300">
            FUNCIONÁRIO
          </Badge>
        );
      case Role.CLIENT:
      default:
        return (
          <Badge variant="secondary" size="sm" className="w-fit mx-auto text-slate-400">
            CLIENTE
          </Badge>
        );
    }
  };

  // Open Edit Modal handler
  const handleOpenEdit = (user: AdminUserItem) => {
    setEditError(null);
    setUserToEdit(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive
    });
  };

  // Submit Create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateUserByAdminData = {
      ...createForm,
      password: autoGeneratePassword ? undefined : createForm.password
    };
    createUserMutation.mutate(payload);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    updateUserMutation.mutate({ userId: userToEdit.id, data: editForm });
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            <span>Gestão de Usuários & Contas</span>
          </h1>
          <p className="text-sm text-slate-400">
            Controle integral de contas, permissões, auditoria e segurança da plataforma
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="teal"
            size="md"
            onClick={() => { setCreateError(null); setIsCreateModalOpen(true); }}
            leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            className="font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
          >
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="w-full sm:w-80">
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs"
          />
        </div>

        {/* Role Select Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filtrar Perfil:</span>
          <Select
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={roleFilterOptions}
            triggerClassName="min-w-[210px] h-10 bg-slate-900 border-slate-700"
            menuClassName="w-64"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-[#0F172A] border-slate-800 shadow-xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1E293B] text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4 text-center">Perfil</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Ações Administrativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-teal-400 text-xs border border-slate-700">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm leading-tight flex items-center gap-2">
                            {u.name}
                            {u.mustChangePassword && (
                              <span
                                title="Usuário precisa trocar a senha no primeiro acesso"
                                className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-normal"
                              >
                                <Lock className="w-2.5 h-2.5" />
                                1º Acesso
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      <p>{u.phone || '—'}</p>
                      {u.cpfCnpj && <p className="text-[11px] text-slate-500 font-mono">CPF/CNPJ: {u.cpfCnpj}</p>}
                    </td>

                    <td className="p-4 text-center">{getRoleBadge(u.role)}</td>

                    <td className="p-4 text-center">
                      <Badge variant={u.isActive ? 'teal' : 'destructive'} size="sm">
                        {u.isActive ? 'ATIVO' : 'SUSPENSO'}
                      </Badge>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Audit Action */}
                        <button
                          type="button"
                          onClick={() => setUserAuditId(u.id)}
                          title="Auditoria Completa do Usuário"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 transition-colors cursor-pointer border border-slate-700"
                        >
                          <FileSearch className="w-4 h-4" />
                        </button>

                        {/* Edit Action */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          title="Editar Cadastro"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-300 transition-colors cursor-pointer border border-slate-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Reset Password Action */}
                        <button
                          type="button"
                          onClick={() => setUserToResetPassword(u)}
                          title="Gerar Nova Senha Provisória por E-mail"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer border border-slate-700"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Toggle Status Action */}
                        {u.role !== Role.SUPER_ADMIN && (
                          u.isActive ? (
                            <button
                              type="button"
                              onClick={() => setUserToBlock(u)}
                              title="Suspender Acesso"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={activateMutation.isPending}
                              onClick={() => activateMutation.mutate(u.id)}
                              title="Reativar Acesso"
                              className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum usuário encontrado</p>
              <p className="text-xs text-slate-400">Tente ajustar o termo de pesquisa ou o filtro por perfil.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. Modal: Criar Novo Usuário */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !createUserMutation.isPending && setIsCreateModalOpen(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Plus className="w-5 h-5" />
            </div>
            <span>Criar Novo Usuário no Sistema</span>
          </div>
        }
        description="Cadastre um novo usuário escolhendo o tipo de conta e permissão de acesso."
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {createError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-0.5">
                <p className="font-semibold text-red-300">Não foi possível criar o usuário</p>
                <p className="text-red-400/90 text-xs leading-relaxed">{createError}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Nome Completo *</label>
              <Input
                required
                placeholder="Ex: Carlos Silva"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                leftIcon={<User className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">E-mail de Acesso *</label>
              <Input
                required
                type="email"
                placeholder="carlos@exemplo.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Telefone (com DDD) *</label>
              <Input
                required
                placeholder="5561999998888"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Tipo de Conta / Perfil (Role) *</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 font-medium"
              >
                <option value={Role.CLIENT}>Cliente (CLIENT)</option>
                <option value={Role.COMPANY_OWNER}>Proprietário de Estabelecimento (COMPANY_OWNER)</option>
                <option value={Role.PROVIDER}>Prestador Autônomo (PROVIDER)</option>
                <option value={Role.EMPLOYEE}>Funcionário da Barbearia (EMPLOYEE)</option>
                <option value={Role.ADMIN}>Administrador do SaaS (ADMIN)</option>
                <option value={Role.SUPER_ADMIN}>Super Administrador (SUPER_ADMIN)</option>
              </select>
            </div>
          </div>

          {/* Password strategy switch */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Gerar Senha Provisória Automaticamente
                </span>
                <p className="text-slate-400 text-[11px]">
                  Cria uma senha aleatória segura, envia por e-mail e exige a troca imediata no 1º login.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoGeneratePassword}
                onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
              />
            </div>

            {!autoGeneratePassword && (
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <label className="text-slate-300 font-semibold block">Definir Senha Inicial Manual</label>
                <Input
                  required={!autoGeneratePassword}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={createUserMutation.isPending}
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="teal"
              size="sm"
              isLoading={createUserMutation.isPending}
              className="font-bold"
            >
              Criar Usuário
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Editar Usuário */}
      <Modal
        isOpen={!!userToEdit}
        onClose={() => !updateUserMutation.isPending && setUserToEdit(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Pencil className="w-5 h-5" />
            </div>
            <span>Editar Dados de Usuário</span>
          </div>
        }
        description={`Atualize as informações cadastrais e nível de acesso de ${userToEdit?.name || ''}`}
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {editError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-0.5">
                <p className="font-semibold text-red-300">Não foi possível atualizar o usuário</p>
                <p className="text-red-400/90 text-xs leading-relaxed">{editError}</p>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Nome Completo</label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">E-mail</label>
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Telefone</label>
            <Input
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Perfil de Acesso (Role)</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
              className="w-full bg-[#0F172A] border border-slate-700 text-white rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 font-medium"
            >
              <option value={Role.CLIENT}>Cliente</option>
              <option value={Role.COMPANY_OWNER}>Proprietário de Estabelecimento</option>
              <option value={Role.PROVIDER}>Prestador</option>
              <option value={Role.EMPLOYEE}>Funcionário</option>
              <option value={Role.ADMIN}>Administrador</option>
              <option value={Role.SUPER_ADMIN}>Super Administrador</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-semibold text-white">Status da Conta:</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={editForm.isActive ? 'teal' : 'outline'}
                size="sm"
                onClick={() => setEditForm({ ...editForm, isActive: true })}
                className="h-7 text-xs"
              >
                Ativo
              </Button>
              <Button
                type="button"
                variant={!editForm.isActive ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setEditForm({ ...editForm, isActive: false })}
                className="h-7 text-xs"
              >
                Suspenso
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={updateUserMutation.isPending}
              onClick={() => setUserToEdit(null)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="teal"
              size="sm"
              isLoading={updateUserMutation.isPending}
              className="font-bold"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal: Redefinir Senha do Usuário */}
      <Modal
        isOpen={!!userToResetPassword}
        onClose={() => !resetPasswordMutation.isPending && setUserToResetPassword(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <span>Redefinir Senha para Provisória</span>
          </div>
        }
        description="Gera uma nova senha aleatória segura que será enviada por e-mail com troca obrigatória no 1º acesso."
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={resetPasswordMutation.isPending}
              onClick={() => setUserToResetPassword(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="teal"
              size="sm"
              isLoading={resetPasswordMutation.isPending}
              onClick={() => userToResetPassword && resetPasswordMutation.mutate(userToResetPassword.id)}
              className="font-bold"
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Gerar e Enviar por E-mail
            </Button>
          </>
        }
      >
        {userToResetPassword && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-white font-bold text-sm">{userToResetPassword.name}</p>
              <p className="text-slate-400 font-mono">{userToResetPassword.email}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-2 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Como funciona este procedimento:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                <li>Uma nova senha aleatória de 10 dígitos com símbolos será gerada pelo servidor.</li>
                <li>Todas as sessões ativas do usuário serão imediatamente invalidadas (logout forçado).</li>
                <li>O e-mail transacional oficial do SinalizeGO será disparado para <strong>{userToResetPassword.email}</strong>.</li>
                <li>Assim que o usuário fizer login com a nova senha provisória, o sistema <strong>bloqueará a navegação</strong> até que ele cadastre sua nova senha pessoal definitiva.</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. Modal: Auditoria Completa de Usuário */}
      <Modal
        isOpen={!!userAuditId}
        onClose={() => setUserAuditId(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <span>Auditoria Detalhada de Usuário</span>
          </div>
        }
        description="Histórico financeiro, agendamentos, vínculos de estabelecimentos e dados cadastrais."
        size="lg"
      >
        {isLoadingAudit ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : auditData ? (
          <div className="space-y-5 text-xs">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{auditData.user.name}</span>
                  {getRoleBadge(auditData.user.role)}
                </div>
                <p className="text-slate-400 font-mono text-xs">{auditData.user.email}</p>
                <p className="text-slate-400 text-xs">Telefone: {auditData.user.phone || '—'}</p>
                {auditData.user.cpfCnpjMasked && (
                  <p className="text-slate-400 text-xs font-mono">CPF: {auditData.user.cpfCnpjMasked}</p>
                )}
                {auditData.user.asaasCustomerId && (
                  <p className="text-teal-400 text-[11px] font-mono">Asaas Customer ID: {auditData.user.asaasCustomerId}</p>
                )}
              </div>

              <div className="text-left sm:text-right space-y-1">
                <Badge variant={auditData.user.isActive ? 'teal' : 'destructive'} size="sm">
                  {auditData.user.isActive ? 'CONTA ATIVA' : 'CONTA SUSPENSA'}
                </Badge>
                <p className="text-slate-500 text-[10px]">
                  Cadastrado em: {new Date(auditData.user.createdAt).toLocaleDateString('pt-BR')}
                </p>
                {auditData.user.mustChangePassword && (
                  <p className="text-amber-400 text-[11px] font-semibold">⚠️ Troca de senha no 1º acesso pendente</p>
                )}
              </div>
            </div>

            {/* Financial & Appointments KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Agendamentos</span>
                <p className="text-xl font-black text-white">{auditData.audit.totalAppointments}</p>
                <p className="text-[10px] text-teal-400 font-medium">
                  {auditData.audit.appointmentCounts['COMPLETED'] || 0} concluídos
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Gasto / Serviços</span>
                <p className="text-xl font-black text-teal-400">{formatCurrency(auditData.audit.totalSpent)}</p>
                <p className="text-[10px] text-slate-400">Sinais: {formatCurrency(auditData.audit.totalDepositsPaid)}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Cancelamentos</span>
                <p className="text-xl font-black text-rose-400">{auditData.audit.appointmentCounts['CANCELED'] || 0}</p>
                <p className="text-[10px] text-slate-400">{auditData.audit.appointmentCounts['NO_SHOW'] || 0} no-shows</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Empresas Vinculadas</span>
                <p className="text-xl font-black text-white">{auditData.audit.companiesCount}</p>
                <p className="text-[10px] text-slate-400 font-mono">proprietário</p>
              </div>
            </div>

            {/* Owned Companies (if any) */}
            {auditData.user.companies && auditData.user.companies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  Estabelecimentos de Propriedade ({auditData.user.companies.length})
                </h4>
                <div className="space-y-2">
                  {auditData.user.companies.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white block text-sm">{comp.businessName}</span>
                        <span className="text-slate-400 text-xs">
                          {comp.city} - {comp.state} • /{comp.slug}
                        </span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <Badge variant={comp.isActive ? 'teal' : 'destructive'} size="sm">
                          {comp.isActive ? 'ATIVA' : 'INATIVA'}
                        </Badge>
                        {comp.financialProfile && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Subconta: {comp.financialProfile.isApproved ? '✅ Aprovada' : '⏳ Pendente'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Appointments */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                Agendamentos Recentes (Últimos 10)
              </h4>
              {auditData.audit.recentAppointments && auditData.audit.recentAppointments.length > 0 ? (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {auditData.audit.recentAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white block">{appt.serviceName}</span>
                        <span className="text-slate-400 text-[11px]">
                          {appt.companyName} • {new Date(appt.appointmentDate).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-teal-400 font-mono font-bold block">
                          {formatCurrency(appt.servicePrice)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{appt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-3 bg-slate-900/50 rounded-xl">
                  Nenhum agendamento recente encontrado.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* 5. Modal: Confirmação de Bloqueio de Usuário */}
      <Modal
        isOpen={!!userToBlock}
        onClose={() => !deactivateMutation.isPending && setUserToBlock(null)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span>Confirmar Bloqueio de Usuário</span>
          </div>
        }
        description="Esta ação revoga imediatamente o acesso da conta à plataforma."
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={deactivateMutation.isPending}
              onClick={() => setUserToBlock(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={deactivateMutation.isPending}
              onClick={() => userToBlock && deactivateMutation.mutate(userToBlock.id)}
              className="font-bold"
              leftIcon={<Power className="w-4 h-4" />}
            >
              Sim, Bloquear Usuário
            </Button>
          </>
        }
      >
        {userToBlock && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white text-sm block">{userToBlock.name}</span>
              <span className="text-slate-400 font-mono block">{userToBlock.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Ao suspender esta conta, o usuário perderá o acesso imediato à plataforma e todas as suas sessões ativas serão invalidadas. Você poderá reativar o acesso a qualquer momento.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AdminUsersPage;
