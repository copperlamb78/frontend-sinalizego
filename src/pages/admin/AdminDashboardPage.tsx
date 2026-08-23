import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Activity,
  ShieldCheck,
  Server
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const globalMetrics = [
    { title: 'Receita Bruta SaaS', value: 'R$ 48.920,00', change: '+32.4% no mês', icon: DollarSign, color: 'text-emerald-400' },
    { title: 'Custos Asaas Pix', value: 'R$ 1.840,00', change: 'R$ 0,99 / split', icon: Activity, color: 'text-amber-400' },
    { title: 'Lucro Líquido Plataforma', value: 'R$ 47.080,00', change: 'Margem de 96.2%', icon: TrendingUp, color: 'text-teal-400' },
    { title: 'Total de Empresas Ativas', value: '128', change: '+14 novas esta semana', icon: Building2, color: 'text-sky-400' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            Platform Intelligence & Governança
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Monitoramento global de receita SaaS, custos de split Pix e estabelecimentos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="teal" dot>
            API NestJS Online (14ms)
          </Badge>
        </div>
      </div>

      {/* Global SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalMetrics.map((m) => (
          <Card key={m.title} hoverEffect>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{m.title}</span>
                <m.icon className={`w-5 h-5 ${m.color}`} />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{m.value}</p>
              <p className="text-xs text-teal-400 font-medium">{m.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Empresas Onboarded</CardTitle>
            <CardDescription>Estabelecimentos recentemente cadastrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Barbearia Vintage Club', slug: 'vintage-club', owner: 'Carlos Eduardo', status: 'ACTIVE' },
              { name: 'Studio Bella Donna', slug: 'bella-donna', owner: 'Fernanda Lima', status: 'ACTIVE' },
              { name: 'Navalha Real', slug: 'navalha-real', owner: 'Roberto Alves', status: 'ACTIVE' }
            ].map((c) => (
              <div key={c.slug} className="flex items-center justify-between p-3 rounded-xl bg-[#1E293B] border border-slate-700/60">
                <div>
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-xs text-slate-400">Dono: {c.owner} • /{c.slug}</p>
                </div>
                <Badge variant="teal" size="sm">ATIVO</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saúde da Infraestrutura</CardTitle>
            <CardDescription>Status dos microsserviços e gateways integrados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E293B]">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white">NestJS Core API</span>
              </div>
              <Badge variant="teal" size="sm">200 OK</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E293B]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-white">Asaas Pix Webhooks</span>
              </div>
              <Badge variant="teal" size="sm">OPERACIONAL</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E293B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span className="text-sm text-white">PostgreSQL & Prisma</span>
              </div>
              <Badge variant="teal" size="sm">CONECTADO</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
