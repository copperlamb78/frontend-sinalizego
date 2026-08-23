import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B1120] relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-400/90 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ambiente Seguro</span>
        </div>
      </div>

      {/* Center Box */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="text-center mb-8 space-y-2">
          <div className="flex justify-center mb-3">
            <Link to="/">
              <Logo size="lg" />
            </Link>
          </div>
          <p className="text-sm text-[#94A3B8]">
            Acesso unificado para clientes, barbeiros e gestores
          </p>
        </div>

        {/* Card for child form */}
        <div className="rounded-2xl bg-[#0F172A] border border-slate-800/90 shadow-2xl shadow-black/50 p-6 sm:p-8 backdrop-blur-md">
          <Outlet />
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 max-w-md w-full mx-auto text-center text-xs text-slate-500">
        <p>SinalizeGO — Plataforma de Gestão e Agendamentos</p>
      </div>
    </div>
  );
};
