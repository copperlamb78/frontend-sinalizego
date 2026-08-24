import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Skeleton } from '@/components/common/Skeleton';
import { toast } from 'sonner';
import {
  Search,
  Building2,
  ExternalLink,
  Power,
  Eye,
  User
} from 'lucide-react';
import type { AdminCompanyItem } from '@/types/admin.types';

export const AdminCompaniesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<AdminCompanyItem | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // 1. Fetch Companies
  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', searchTerm, statusFilter],
    queryFn: () =>
      adminService.getCompanies({
        search: searchTerm || undefined,
        status: statusFilter
      })
  });

  // 2. Toggle Company Status Mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleCompanyStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-metrics'] });
      toast.success('Status do estabelecimento atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Não foi possível alterar o status do estabelecimento.');
    }
  });

  const companies: AdminCompanyItem[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? (data as any)
    : [];

  const handleAuditClick = (comp: AdminCompanyItem) => {
    setSelectedCompany(comp);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-400" />
            <span>Gestão de Estabelecimentos</span>
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Auditoria, moderação e controle de status de todas as barbearias e salões cadastrados
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Buscar por nome ou slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-xl border border-slate-800 shrink-0">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'Todos' : st === 'ACTIVE' ? 'Ativos' : 'Inativos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Companies Table */}
      <Card className="bg-[#0F172A] border-slate-800 shadow-xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : companies.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1E293B] text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Estabelecimento</th>
                  <th className="p-4">Proprietário / Contato</th>
                  <th className="p-4">Localização</th>
                  <th className="p-4 text-center">Atendimentos</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações de Moderação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{c.businessName}</span>
                      </div>
                      <a
                        href={`/empresa/${c.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-teal-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>/{c.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="p-4">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-200">{c.owner?.name || 'Não vinculado'}</p>
                        <p className="text-slate-400">{c.owner?.email || c.owner?.phone || '—'}</p>
                      </div>
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      {c.city} - {c.state}
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-bold text-teal-400 text-xs">
                        {c._count?.appointments || 0}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <Badge variant={c.isActive ? 'teal' : 'destructive'} size="sm">
                        {c.isActive ? 'ATIVO' : 'SUSPENSO'}
                      </Badge>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                          onClick={() => handleAuditClick(c)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Auditar
                        </Button>

                        <Button
                          variant={c.isActive ? 'destructive' : 'secondary'}
                          size="sm"
                          className="h-8 text-xs font-bold"
                          isLoading={toggleMutation.isPending && toggleMutation.variables === c.id}
                          onClick={() => toggleMutation.mutate(c.id)}
                          leftIcon={<Power className="w-3.5 h-3.5" />}
                        >
                          {c.isActive ? 'Suspender' : 'Reativar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">Nenhum estabelecimento encontrado</p>
              <p className="text-xs text-slate-400">Tente ajustar seus termos de busca ou filtros.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Detail Modal */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Auditoria de Estabelecimento"
        description="Ficha cadastral consolidada da plataforma"
        size="md"
      >
        {selectedCompany && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm">{selectedCompany.businessName}</span>
                <Badge variant={selectedCompany.isActive ? 'teal' : 'destructive'} size="sm">
                  {selectedCompany.isActive ? 'OPERACIONAL' : 'SUSPENSO'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Identificador Único</span>
                  <span className="font-mono text-[11px] text-teal-400">{selectedCompany.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Slug Público</span>
                  <span className="font-mono text-[11px] text-white">/{selectedCompany.slug}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Cidade / UF</span>
                  <span>{selectedCompany.city} - {selectedCompany.state}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Data de Cadastro</span>
                  <span>{new Date(selectedCompany.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Owner Details */}
            <div className="p-4 rounded-2xl bg-[#0B1120] border border-slate-800 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-400" />
                <span>Dados do Proprietário</span>
              </span>
              <p className="text-slate-300 font-semibold">{selectedCompany.owner?.name}</p>
              <p className="text-slate-400 font-mono text-[11px]">{selectedCompany.owner?.email}</p>
              {selectedCompany.owner?.phone && (
                <p className="text-slate-400">{selectedCompany.owner?.phone}</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button size="sm" onClick={() => setIsAuditModalOpen(false)}>
                Fechar Auditoria
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
