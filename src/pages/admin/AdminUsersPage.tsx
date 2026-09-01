import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { toast } from 'sonner';
import { Search, Users, Power, UserCheck, ShieldAlert, AlertTriangle, User } from 'lucide-react';
import { Role } from '@/types/auth.types';
import type { AdminUserItem } from '@/types/admin.types';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [userToBlock, setUserToBlock] = useState<AdminUserItem | null>(null);

  // 1. Fetch Users List
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => adminService.getUsers()
  });

  // 2. Deactivate User Mutation
  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => adminService.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      toast.success('Conta de usuário suspensa com sucesso.');
      setUserToBlock(null);
    },
    onError: () => {
      toast.error('Erro ao suspender conta de usuário.');
    }
  });

  // 3. Reactivate User Mutation
  const activateMutation = useMutation({
    mutationFn: (userId: string) => adminService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      toast.success('Conta de usuário reativada com sucesso.');
    },
    onError: () => {
      toast.error('Erro ao reativar conta de usuário.');
    }
  });

  const rawUsers: AdminUserItem[] = Array.isArray(users)
    ? users
    : Array.isArray((users as any)?.data)
    ? (users as any).data
    : [];

  // ⚡ Bolt: Added useMemo with early return and cached searchTerm.toLowerCase()
  // to avoid O(N) array filtering and redundant string lowercasing on every render.
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return rawUsers;

    const lowerQuery = searchTerm.toLowerCase();
    return rawUsers.filter((u) =>
      (u.name || '').toLowerCase().includes(lowerQuery) ||
      (u.email || '').toLowerCase().includes(lowerQuery) ||
      (u.phone && u.phone.includes(searchTerm))
    );
  }, [rawUsers, searchTerm]);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return <Badge variant="destructive" size="sm">SUPER ADMIN</Badge>;
      case Role.ADMIN:
        return <Badge variant="destructive" size="sm">ADMIN</Badge>;
      case Role.COMPANY_OWNER:
        return <Badge variant="teal" size="sm">DONO</Badge>;
      default:
        return <Badge variant="neutral" size="sm">CLIENTE</Badge>;
    }
  };

  const handleConfirmBlock = () => {
    if (userToBlock) {
      deactivateMutation.mutate(userToBlock.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            <span>Usuários & Moderação</span>
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Controle de acessos, moderação e ativação/desativação de contas da plataforma
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-[#0F172A] border-slate-800 shadow-xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1E293B] text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Nome do Usuário</th>
                  <th className="p-4">E-mail de Acesso</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4 text-center">Perfil (Role)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ação de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {u.name}
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-400">
                      {u.email}
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      {u.phone || '—'}
                    </td>

                    <td className="p-4 text-center">
                      {getRoleBadge(u.role)}
                    </td>

                    <td className="p-4 text-center">
                      <Badge variant={u.isActive ? 'teal' : 'destructive'} size="sm">
                        {u.isActive ? 'ATIVO' : 'SUSPENSO'}
                      </Badge>
                    </td>

                    <td className="p-4 text-right">
                      {u.role !== Role.SUPER_ADMIN ? (
                        u.isActive ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs font-bold cursor-pointer"
                            onClick={() => setUserToBlock(u)}
                            leftIcon={<Power className="w-3.5 h-3.5" />}
                          >
                            Bloquear
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs font-bold text-teal-300 cursor-pointer"
                            isLoading={activateMutation.isPending && activateMutation.variables === u.id}
                            onClick={() => activateMutation.mutate(u.id)}
                            leftIcon={<UserCheck className="w-3.5 h-3.5 text-teal-400" />}
                          >
                            Reativar
                          </Button>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Irrestrito</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum usuário encontrado</p>
              <p className="text-xs text-slate-400">Tente ajustar o termo de pesquisa.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Block Confirmation Modal */}
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
              className="cursor-pointer border-slate-700 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={deactivateMutation.isPending}
              onClick={handleConfirmBlock}
              className="cursor-pointer font-bold"
              leftIcon={<Power className="w-4 h-4" />}
            >
              Sim, Bloquear Usuário
            </Button>
          </>
        }
      >
        {userToBlock && (
          <div className="space-y-4 text-xs">
            {/* User Details Card */}
            <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-white text-sm">{userToBlock.name}</span>
                </div>
                {getRoleBadge(userToBlock.role)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">E-mail de Login</span>
                  <span className="font-mono text-[11px] text-white">{userToBlock.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Telefone</span>
                  <span className="text-[11px] text-slate-300">{userToBlock.phone || 'Não informado'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">ID Único</span>
                  <span className="font-mono text-[11px] text-teal-400">{userToBlock.id}</span>
                </div>
              </div>
            </div>

            {/* Warning Alert Banner */}
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
