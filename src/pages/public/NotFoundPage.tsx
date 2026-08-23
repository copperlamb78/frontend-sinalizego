import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-teal-400 font-mono font-black text-3xl shadow-xl">
        404
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Página Não Encontrada</h1>
        <p className="text-sm text-[#94A3B8]">
          O endereço digitado não existe ou foi removido. Verifique o link e tente novamente.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button leftIcon={<Home className="w-4 h-4" />}>Voltar para o Início</Button>
        </Link>
      </div>
    </div>
  );
};
