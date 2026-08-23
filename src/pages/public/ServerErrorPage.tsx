import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  AlertTriangle,
  RotateCcw,
  Home,
  ShieldCheck
} from 'lucide-react';

interface ServerErrorPageProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({
  error,
  resetErrorBoundary
}) => {
  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <Card className="max-w-lg w-full p-8 bg-[#0F172A] border-amber-500/30 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

        {/* Icon & 500 Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
            <span>INSTABILIDADE TEMPORÁRIA</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Algo inesperado aconteceu
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Ocorreu uma instabilidade ao processar esta ação. Seus dados e agendamentos permanecem salvos e seguros.
          </p>
        </div>

        {/* Error Detail (Dev Mode Only) */}
        {error && process.env.NODE_ENV === 'development' && (
          <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 text-left overflow-x-auto text-[11px] font-mono text-red-400 max-h-32">
            <p className="font-bold">{error.name}: {error.message}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Nenhuma informação ou pagamento foi comprometido.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReload}
            className="w-full sm:w-auto text-xs h-10 border-slate-700 hover:bg-slate-800 cursor-pointer"
            leftIcon={<RotateCcw className="w-4 h-4 text-amber-400" />}
          >
            Tentar Novamente
          </Button>

          <Link to="/" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full sm:w-auto text-xs h-10 font-bold shadow-md shadow-teal-500/20 cursor-pointer"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Voltar para o Início
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
