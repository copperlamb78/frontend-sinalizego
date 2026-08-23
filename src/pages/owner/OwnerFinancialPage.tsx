import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const OwnerFinancialPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Financeiro & Subconta Asaas</h1>
        <p className="text-sm text-[#94A3B8]">
          Gestão de split Pix, saldo acumulado e extrato de repasses automáticos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Status da Subconta</CardTitle>
              <Badge variant="teal" dot>ATIVA</Badge>
            </div>
            <CardDescription>Gateway de pagamentos Asaas Sandbox</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1E293B] border border-slate-700 space-y-2">
              <span className="text-xs text-slate-400">Wallet ID Asaas</span>
              <p className="font-mono text-sm font-bold text-teal-400">
                wal_8923489234789123
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Chave Pix Cadastrada:</span>
              <span className="font-mono text-white font-semibold">11.234.567/0001-89</span>
            </div>

            <div className="pt-2">
              <Button variant="secondary" className="w-full" size="sm" rightIcon={<ExternalLink className="w-4 h-4" />}>
                Acessar Portal Asaas
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Saldo</CardTitle>
            <CardDescription>Valores líquidos disponíveis para transferência</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-slate-400">Saldo Disponível</span>
              <p className="text-3xl font-black text-white">R$ 2.882,50</p>
            </div>

            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
              <ShieldCheck className="w-4 h-4 inline mr-1.5" />
              As transferências Pix são liquidadas instantaneamente após conclusão do atendimento.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
