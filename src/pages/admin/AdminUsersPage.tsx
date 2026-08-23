import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';
import { toast } from 'sonner';
import { Search, Users, Power, UserCheck } from 'lucide-react';
import { Role } from '@/types/auth.types';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredUsers = (users || []).filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone && u.phone.includes(searchTerm))
  );

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
                            className="h-8 text-xs font-bold"
                            isLoading={deactivateMutation.isPending && deactivateMutation.variables === u.id}
                            onClick={() => deactivateMutation.mutate(u.id)}
                            leftIcon={<Power className="w-3.5 h-3.5" />}
                          >
                            Bloquear
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs font-bold text-teal-300"
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
    </div>
  );
};
