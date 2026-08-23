import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import {
  Scissors,
  QrCode,
  ShieldAlert,
  Search,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [searchSlug, setSearchSlug] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSlug.trim()) {
      navigate(`/empresa/${searchSlug.trim().toLowerCase()}`);
    }
  };

  const sampleCompanies = [
    { name: 'Barbearia Vintage Club', slug: 'vintage-club', city: 'São Paulo, SP', category: 'Barbearia' },
    { name: 'Studio Bella Donna', slug: 'bella-donna', city: 'Curitiba, PR', category: 'Salão de Beleza' },
    { name: 'Navalha de Ouro', slug: 'navalha-de-ouro', city: 'Belo Horizonte, MG', category: 'Barbearia' }
  ];

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E293B] border border-teal-500/30 text-teal-400 text-xs font-semibold glow-teal-sm">
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Agendamentos Inteligentes com Sinal Pix</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#F8FAFC] tracking-tight max-w-4xl mx-auto leading-tight">
          Agendamentos sem faltas com{' '}
          <span className="bg-gradient-to-r from-[#14B8A6] via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Sinal Pix Automático
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Gere reservas confirmadas com sinal antecipado. O cliente paga pelo Pix em segundos e seu estabelecimento tem o comparecimento garantido.
        </p>

        {/* Quick Search Bar */}
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Digite o nome ou link do estabelecimento (ex: vintage-club)"
              value={searchSlug}
              onChange={(e) => setSearchSlug(e.target.value)}
              leftIcon={<Search className="w-5 h-5 text-slate-400" />}
              className="h-12 text-sm"
            />
            <Button
              type="submit"
              size="lg"
              className="shrink-0 h-12"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Buscar
            </Button>
          </form>
        </div>

        {/* Establishments Quick Showcase */}
        <div className="pt-8">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
            Ou explore estabelecimentos em destaque:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {sampleCompanies.map((c) => (
              <Link
                key={c.slug}
                to={`/empresa/${c.slug}`}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-teal-500/50 hover:bg-[#1E293B] text-xs font-medium text-slate-300 transition-all duration-200"
              >
                <Scissors className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-semibold text-white">{c.name}</span>
                <span className="text-slate-500">• {c.city}</span>
                <Badge variant="teal" size="sm">{c.category}</Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            Mais Praticidade e Segurança para Todos
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-xl mx-auto">
            Desenvolvido para garantir agendamentos sem imprevistos, comodidade para os clientes e previsibilidade de caixa para os profissionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none" />
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <CardTitle>Sinal Pix Seguro</CardTitle>
              <CardDescription>
                Geração de QR Code dinâmico com confirmação automática de pagamento na tela.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Confirmação instantânea de horário assim que o Pix é pago</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Reserva garantida com repasse financeiro transparente</span>
              </div>
            </CardContent>
          </Card>

          <Card hoverEffect className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <CardTitle>Comparecimento Garantido</CardTitle>
              <CardDescription>
                Pagamento de sinal proporcional que protege o horário reservado e evita desistências.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Opções flexíveis de sinal para o cliente escolher</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Política clara de cancelamento e remarcação</span>
              </div>
            </CardContent>
          </Card>

          <Card hoverEffect className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none" />
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2">
                <TrendingUp className="w-6 h-6" />
              </div>
              <CardTitle>Painel do Estabelecimento</CardTitle>
              <CardDescription>
                Acompanhe seus agendamentos, faturamento, horários livres e clientes em uma única tela.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Finalização rápida dos atendimentos do dia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Organização por serviços e profissionais</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-teal-500/30 p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              Pronto para transformar a agenda do seu estabelecimento?
            </h3>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Cadastre sua barbearia em menos de 3 minutos, configure seus serviços e comece a receber reservas com sinal Pix garantido.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/cadastro">
              <Button size="lg" className="px-8 font-bold" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Começar Gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8">
                Já tenho uma conta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
