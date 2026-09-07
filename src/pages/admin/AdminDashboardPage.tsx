import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Store,
  Users,
  CalendarCheck,
  Award,
  Activity,
  Server,
  ShieldCheck,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import type { AdminDashboardMetrics } from '@/types/admin.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Skeleton } from '@/components/common/Skeleton';
import { formatCurrency } from '@/lib/utils';

export const AdminDashboardPage: React.FC = () => {
  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: metrics, isLoading } = useQuery<AdminDashboardMetrics>({
    queryKey: ['admin-dashboard-metrics', startDate, endDate],
    queryFn: () => adminService.getDashboardMetrics({ startDate, endDate })
  });

  // Date Presets
  const setPreset = (preset: 'THIS_MONTH' | 'LAST_30_DAYS' | 'ALL_TIME') => {
    const now = new Date();
    if (preset === 'THIS_MONTH') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'LAST_30_DAYS') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Safe KPI calculations
  const platformGross =
    metrics?.financial?.platformGrossRevenue ?? metrics?.platformGrossRevenue ?? 0;
  const asaasCosts =
    metrics?.financial?.totalAsaasPixCosts ?? metrics?.totalAsaasPixCosts ?? 0;
  const netProfit =
    metrics?.financial?.platformNetProfit ?? metrics?.platformNetProfit ?? 0;
  const gmv = metrics?.financial?.gmv ?? metrics?.gmv ?? 0;
  const escrowFee = metrics?.financial?.platformFeeInEscrow ?? 0;

  // Growth calculations
  const totalCompanies =
    metrics?.growth?.companies?.total ?? metrics?.growth?.totalCompanies ?? 0;
  const activeCompanies =
    metrics?.growth?.companies?.active ?? metrics?.growth?.activeCompanies ?? 0;
  const inactiveCompanies =
    metrics?.growth?.companies?.inactive ?? metrics?.growth?.inactiveCompanies ?? 0;

  const totalUsers =
    metrics?.growth?.users?.total ?? metrics?.growth?.totalUsers ?? 0;
  const clientsCount =
    metrics?.growth?.users?.clients ?? metrics?.growth?.clients ?? 0;
  const ownersCount =
    metrics?.growth?.users?.owners ?? metrics?.growth?.companyOwners ?? 0;

  const totalAppointments = metrics?.growth?.appointments?.total ?? 0;
  const completedAppointments = metrics?.growth?.appointments?.completed ?? 0;
  const confirmedAppointments = metrics?.growth?.appointments?.confirmed ?? 0;
  const canceledAppointments = metrics?.growth?.appointments?.canceled ?? 0;
  const noShowAppointments = metrics?.growth?.appointments?.noShow ?? 0;
  const pendingPaymentAppointments = metrics?.growth?.appointments?.pendingPayment ?? 0;

  const lossPrevented = metrics?.lossPrevented;

  const kpis = [
    {
      title: 'GMV Transacionado',
      value: formatCurrency(gmv),
      detail: 'Volume financeiro bruto movimentado no período',
      icon: TrendingUp,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      title: 'Receita Bruta do SaaS',
      value: formatCurrency(platformGross),
      detail: `Taxas de serviço auferidas (+ ${formatCurrency(escrowFee)} em custódia)`,
      icon: DollarSign,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10'
    },
    {
      title: 'Lucro Líquido Plataforma',
      value: formatCurrency(netProfit),
      detail: `Margem livre após dedução de ${formatCurrency(asaasCosts)} em custos Pix`,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Custos Gateway Asaas',
      value: formatCurrency(asaasCosts),
      detail: 'Tarifas de Pix absorvidas pela plataforma',
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-400" />
            <span>Platform Intelligence & Métricas</span>
          </h1>
          <p className="text-sm text-slate-400">
            Visão consolidada de receita, volume GMV, adesão de estabelecimentos e infraestrutura
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0F172A] p-2 rounded-2xl border border-slate-800 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 px-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span className="font-semibold hidden sm:inline">Período:</span>
          </div>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            containerClassName="w-auto"
            className="h-8 text-xs w-36 bg-slate-900 border-slate-700 text-white font-medium px-2.5"
          />
          <span className="text-slate-400 text-xs font-medium px-0.5">até</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            containerClassName="w-auto"
            className="h-8 text-xs w-36 bg-slate-900 border-slate-700 text-white font-medium px-2.5"
          />

          <div className="flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={() => setPreset('THIS_MONTH')}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              Este Mês
            </button>
            <button
              type="button"
              onClick={() => setPreset('LAST_30_DAYS')}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              30 Dias
            </button>
            <button
              type="button"
              onClick={() => setPreset('ALL_TIME')}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              Geral
            </button>
          </div>
        </div>
      </div>

      {/* 1. Global SaaS Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((k) => (
          <Card key={k.title} hoverEffect className="bg-[#0F172A] border-slate-800">
            <CardContent className="p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{k.title}</span>
                <div className={`p-2 rounded-xl ${k.bg}`}>
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{k.value}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{k.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Platform Growth & Volume Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Companies Card */}
        <Card className="bg-[#0F172A] border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estabelecimentos</span>
            <Store className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalCompanies}</span>
            <span className="text-xs text-teal-400 font-bold">({activeCompanies} ativos)</span>
          </div>
          <p className="text-xs text-slate-500">
            {inactiveCompanies} estabelecimentos suspensos ou em moderação
          </p>
        </Card>

        {/* Users Card */}
        <Card className="bg-[#0F172A] border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Usuários Ativos</span>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalUsers}</span>
            <span className="text-xs text-sky-400 font-bold">({clientsCount} clientes)</span>
          </div>
          <p className="text-xs text-slate-500">
            {ownersCount} proprietários de barbearias e salões
          </p>
        </Card>

        {/* Appointments Card */}
        <Card className="bg-[#0F172A] border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volume de Atendimentos</span>
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalAppointments}</span>
            <span className="text-xs text-emerald-400 font-bold">({completedAppointments} concluídos)</span>
          </div>
          <p className="text-xs text-slate-500">
            {confirmedAppointments} confirmados • {canceledAppointments} cancelados
          </p>
        </Card>
      </div>

      {/* 3. Detailed Appointment Breakdown & Loss Prevention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status Breakdown */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-teal-400" />
              <span>Distribuição por Status de Agendamento</span>
            </CardTitle>
            <CardDescription>Detalhamento de volume e taxas no funil de atendimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Concluídos
                </div>
                <span className="text-2xl font-black text-white">{completedAppointments}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  Confirmados
                </div>
                <span className="text-2xl font-black text-white">{confirmedAppointments}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  Pendentes Pix
                </div>
                <span className="text-2xl font-black text-white">{pendingPaymentAppointments}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelados
                </div>
                <span className="text-2xl font-black text-white">{canceledAppointments}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No-Show
                </div>
                <span className="text-2xl font-black text-white">{noShowAppointments}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anti-No-Show Loss Prevention (Platform Value Shield) */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Proteção Contra Faltas (Anti-No-Show)</span>
            </CardTitle>
            <CardDescription>Prevenção de perdas e retenção de sinal para estabelecimentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300">Receita Salva / Retida</span>
                <p className="text-xl font-black text-white">
                  {formatCurrency(lossPrevented?.totalLossPrevented || 0)}
                </p>
                <p className="text-[10px] text-amber-300">
                  {lossPrevented?.retainedAppointmentsCount || 0} agendamentos protegidos
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Taxa de Eficiência</span>
                <p className="text-xl font-black text-teal-400">
                  {lossPrevented?.protectionEfficiencyRate || 0}%
                </p>
                <p className="text-[10px] text-slate-400">Retenção de sinal mitigadora</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              O modelo de sinal pré-pago garante que faltas sem aviso prévio e cancelamentos tardios (inferiores a 2h)
              convertam 100% do sinal em indenização direta para a cadeira da barbearia.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Top Tenants Ranking & Infrastructure Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Tenants */}
        <Card className="bg-[#0F172A] border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Top Estabelecimentos (Volume)</span>
            </CardTitle>
            <CardDescription>Parceiros com maior geração de receita e agendamentos</CardDescription>
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
              <p className="text-xs text-slate-500 text-center py-6">Nenhum dado registrado para o período.</p>
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
export default AdminDashboardPage;
