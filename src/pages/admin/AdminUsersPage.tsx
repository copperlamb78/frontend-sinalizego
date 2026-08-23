import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Search } from 'lucide-react';
import { Input } from '@/components/common/Input';

export const AdminUsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Usuários & Moderação</h1>
          <p className="text-sm text-[#94A3B8]">
            Controle de acessos, moderação e ativação/desativação de contas
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input placeholder="Buscar por nome ou e-mail..." leftIcon={<Search className="w-4 h-4" />} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1E293B] text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Perfil (Role)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { name: 'Antonio Gabriel', email: 'admin@sinalizego.com', role: 'SUPER_ADMIN', active: true },
                { name: 'Carlos Eduardo', email: 'carlos@vintageclub.com', role: 'COMPANY_OWNER', active: true },
                { name: 'Rodrigo Silva', email: 'rodrigo.silva@gmail.com', role: 'CLIENT', active: true }
              ].map((u) => (
                <tr key={u.email} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 text-xs font-mono text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <Badge variant={u.role === 'SUPER_ADMIN' ? 'destructive' : u.role === 'COMPANY_OWNER' ? 'teal' : 'neutral'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.active ? 'teal' : 'destructive'} size="sm">
                      {u.active ? 'ATIVO' : 'INATIVO'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      Editar
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
