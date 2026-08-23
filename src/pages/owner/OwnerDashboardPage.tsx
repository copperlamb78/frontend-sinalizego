import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const metrics = [
    {
      title: 'Faturamento Bruto',
      value: 'R$ 8.450,00',
      change: '+18.2%',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Sinais Pix Recebidos',
      value: 'R$ 3.225,00',
      change: '100% garantido',
      icon: ShieldCheck,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10'
    },
    {
      title: 'Atendimentos do Mês',
      value: '142',
      change: '94% taxa de presença',
      icon: CalendarCheck,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      title: 'Taxas Retidas (Plataforma)',
      value: 'R$ 342,50',
      change: 'Asaas Split',
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Visão consolidada de faturamento, sinais Pix e atendimentos em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="teal" size="md" dot>
            Asaas Subconta Conectada
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m) => (
          <Card key={m.title} hoverEffect className="relative overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  {m.title}
                </span>
                <div className={`p-2.5 rounded-xl ${m.bg} ${m.color} border border-slate-700/60`}>
                  <m.icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
                  {m.value}
                </p>
                <p className="text-xs text-teal-400 font-medium flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{m.change}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fila de Atendimentos de Hoje</CardTitle>
                <CardDescription>Agendamentos com sinal compensado aguardando atendimento</CardDescription>
              </div>
              <Badge variant="teal">3 Hoje</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { time: '14:00', client: 'Rodrigo Silva', service: 'Corte Degrade Navalhado', price: 55, down: 27.5 },
              { time: '15:00', client: 'Lucas Mendes', service: 'Barboterapia com Toalha Quente', price: 45, down: 22.5 },
              { time: '16:30', client: 'Gabriel Castro', service: 'Combo Cabelo + Barba Premium', price: 90, down: 45 }
            ].map((item) => (
              <div
                key={item.time}
                className="flex items-center justify-between p-4 rounded-xl bg-[#1E293B] border border-slate-700/60"
              >
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 rounded-lg bg-[#0F172A] border border-slate-700 font-mono text-sm font-bold text-teal-400">
                    {item.time}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.client}</p>
                    <p className="text-xs text-[#94A3B8]">{item.service}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-white font-bold">R$ {item.price.toFixed(2)}</p>
                    <p className="text-[11px] text-teal-400">Sinal: R$ {item.down.toFixed(2)}</p>
                  </div>
                  <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                    Concluir
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Serviços do Mês</CardTitle>
            <CardDescription>Serviços com maior volume de sinal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Corte Navalhado', count: 68, pct: '85%' },
              { name: 'Barboterapia', count: 42, pct: '60%' },
              { name: 'Combo Cabelo + Barba', count: 32, pct: '45%' }
            ].map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{s.name}</span>
                  <span className="text-teal-400 font-mono">{s.count} agendamentos</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: s.pct }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
