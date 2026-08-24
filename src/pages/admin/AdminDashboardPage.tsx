import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Skeleton } from '@/components/common/Skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Activity,
  ShieldCheck,
  Server,
  Users,
  CalendarCheck,
  Store,
  Award
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-dashboard-metrics'],
    queryFn: () => adminService.getDashboardMetrics()
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-16 bg-slate-800/40 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const grossRevenue = metrics?.financial?.platformGrossRevenue ?? metrics?.platformGrossRevenue ?? 0;
  const asaasCosts = metrics?.financial?.totalAsaasPixCosts ?? metrics?.totalAsaasPixCosts ?? 0;
  const netProfit = metrics?.financial?.platformNetProfit ?? metrics?.platformNetProfit ?? 0;
  const gmv = metrics?.financial?.gmv ?? metrics?.gmv ?? 0;

  const totalCompanies = metrics?.growth?.companies?.total ?? metrics?.growth?.totalCompanies ?? 0;
  const activeCompanies = metrics?.growth?.companies?.active ?? metrics?.growth?.activeCompanies ?? 0;
  const inactiveCompanies = metrics?.growth?.companies?.inactive ?? metrics?.growth?.inactiveCompanies ?? 0;

  const totalUsers = metrics?.growth?.users?.total ?? metrics?.growth?.totalUsers ?? 0;
  const clientsCount = metrics?.growth?.users?.clients ?? metrics?.growth?.clients ?? 0;
  const ownersCount = metrics?.growth?.users?.owners ?? metrics?.growth?.companyOwners ?? 0;

  const completedAppointments =
    metrics?.growth?.appointments?.completed ??
    metrics?.growth?.appointmentsByStatus?.COMPLETED ??
    0;
  const confirmedAppointments =
    metrics?.growth?.appointments?.confirmed ??
    metrics?.growth?.appointmentsByStatus?.CONFIRMED ??
    0;
  const canceledAppointments =
    metrics?.growth?.appointments?.canceled ??
    metrics?.growth?.appointmentsByStatus?.CANCELED ??
    0;

  const kpis = [
    {
      title: 'Receita Bruta da Plataforma',
      value: formatCurrency(grossRevenue),
      detail: 'Comissões SaaS acumuladas',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Custos Gateway Asaas Pix',
      value: formatCurrency(asaasCosts),
      detail: 'Taxas de split e transferências',
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Lucro Líquido Plataforma',
      value: formatCurrency(netProfit),
      detail: 'Margem operacional retida',
      icon: TrendingUp,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10'
    },
    {
      title: 'GMV Transacionado Total',
      value: formatCurrency(gmv),
      detail: 'Volume bruto de reservas',
      icon: Building2,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            Platform Intelligence & Governança
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Monitoramento executivo de receita SaaS, custos de split Pix e estabelecimentos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="teal" dot>
            API NestJS Conectada
          </Badge>
        </div>
      </div>

      {/* 1. Global SaaS Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <Card key={k.title} hoverEffect className="bg-[#0F172A] border-slate-800">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{k.title}</span>
                <div className={`p-2 rounded-xl ${k.bg}`}>
                  <k.icon className={`w-5 h-5 ${k.color}`} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{k.value}</p>
              <p className="text-xs text-slate-400 font-medium">{k.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Platform Growth & Volume Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-[#0F172A] border-slate-800 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estabelecimentos</span>
            <Store className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalCompanies}</span>
            <span className="text-xs text-teal-400 font-semibold">({activeCompanies} ativos)</span>
          </div>
          <p className="text-xs text-slate-500">
            {inactiveCompanies} estabelecimentos inativos ou em moderação
          </p>
        </Card>

        <Card className="bg-[#0F172A] border-slate-800 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Usuários</span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalUsers}</span>
            <span className="text-xs text-sky-400 font-semibold">({clientsCount} clientes)</span>
          </div>
          <p className="text-xs text-slate-500">
            {ownersCount} proprietários de barbearias e salões
          </p>
        </Card>

        <Card className="bg-[#0F172A] border-slate-800 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Atendimentos Concluídos</span>
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {completedAppointments}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">concluídos</span>
          </div>
          <p className="text-xs text-slate-500">
            {confirmedAppointments} agendados | {canceledAppointments} cancelados
          </p>
        </Card>
      </div>

      {/* 3. Top Tenants Ranking & Infrastructure Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tenants */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Top Estabelecimentos (Volume)</span>
                </CardTitle>
                <CardDescription>Parceiros com maior geração de receita e agendamentos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics?.topTenants && metrics.topTenants.length > 0 ? (
              metrics.topTenants.map((t, idx) => {
                const tenantId = t.id || t.companyId || `tenant-${idx}`;
                const appointmentsCount = t.completedAppointments ?? t.appointmentsCount ?? 0;
                const platformFees = t.platformFeesGenerated ?? t.platformFeeGenerated ?? 0;

                return (
                  <div
                    key={tenantId}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E293B] border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-teal-400 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{t.businessName}</p>
                        <p className="text-xs text-slate-400">
                          {appointmentsCount} atendimentos • /{t.slug}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-teal-400">{formatCurrency(t.totalRevenue || 0)}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Taxas: {formatCurrency(platformFees)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">Nenhum dado registrado.</p>
            )}
          </CardContent>
        </Card>

        {/* Infrastructure Status */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-teal-400" />
              <span>Saúde dos Serviços & Integrações</span>
            </CardTitle>
            <CardDescription>Status operacional dos microsserviços e gateways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E293B] border border-slate-800">
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-sm font-bold text-white block">NestJS Core API</span>
                  <span className="text-[11px] text-slate-400">Autenticação JWT, Regras de Negócio e Split</span>
                </div>
              </div>
              <Badge variant="teal" size="sm">200 OK</Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E293B] border border-slate-800">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-sm font-bold text-white block">Asaas Gateway Pix</span>
                  <span className="text-[11px] text-slate-400">Emissão de QR Code dinâmico e Webhooks</span>
                </div>
              </div>
              <Badge variant="teal" size="sm">OPERACIONAL</Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E293B] border border-slate-800">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-sm font-bold text-white block">PostgreSQL & Prisma ORM</span>
                  <span className="text-[11px] text-slate-400">Armazenamento ACID com proteção de concorrência</span>
                </div>
              </div>
              <Badge variant="teal" size="sm">CONECTADO</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
