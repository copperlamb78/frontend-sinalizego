import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Search } from 'lucide-react';
import { Input } from '@/components/common/Input';

export const AdminCompaniesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Gestão de Empresas</h1>
          <p className="text-sm text-[#94A3B8]">
            Auditoria, moderação e controle de status de todos os estabelecimentos cadastrados
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input placeholder="Buscar empresa por nome ou slug..." leftIcon={<Search className="w-4 h-4" />} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1E293B] text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Empresa</th>
                <th className="p-4">Slug</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { name: 'Barbearia Vintage Club', slug: 'vintage-club', phone: '11999999999', status: 'ACTIVE' },
                { name: 'Studio Bella Donna', slug: 'bella-donna', phone: '41988888888', status: 'ACTIVE' },
                { name: 'Navalha de Ouro', slug: 'navalha-de-ouro', phone: '31977777777', status: 'SUSPENDED' }
              ].map((c) => (
                <tr key={c.slug} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white">{c.name}</td>
                  <td className="p-4 font-mono text-xs text-teal-400">/{c.slug}</td>
                  <td className="p-4 text-xs text-slate-400">{c.phone}</td>
                  <td className="p-4">
                    <Badge variant={c.status === 'ACTIVE' ? 'teal' : 'destructive'} size="sm">
                      {c.status === 'ACTIVE' ? 'ATIVO' : 'SUSPENSO'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm">
                      Auditar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
