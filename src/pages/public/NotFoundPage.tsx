import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import {
  Compass,
  Home,
  SearchX,
  Store,
  ArrowRight
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const [searchSlug, setSearchSlug] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSlug.trim()) {
      navigate(`/empresa/${searchSlug.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <Card className="max-w-lg w-full p-8 bg-[#0F172A] border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-teal-500/10 blur-2xl rounded-full pointer-events-none" />

        {/* Icon & 404 Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#1E293B] border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400 shadow-lg shadow-teal-500/10">
          <SearchX className="w-8 h-8" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-slate-700 text-slate-400 font-mono text-xs font-semibold">
            <span>ERRO 404</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Página ou barbearia não encontrada
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            O endereço acessado não existe, foi desativado ou o link da barbearia foi digitado incorretamente.
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearch} className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-300 block text-left">
            Procurando uma barbearia específica?
          </span>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o link (ex: vintage-club)"
              value={searchSlug}
              onChange={(e) => setSearchSlug(e.target.value)}
              leftIcon={<Store className="w-4 h-4 text-slate-400" />}
              className="h-10 text-xs"
            />
            <Button
              type="submit"
              size="sm"
              className="shrink-0 h-10 px-4 text-xs font-bold"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Buscar
            </Button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-slate-800">
          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs h-10 border-slate-700 hover:bg-slate-800 cursor-pointer"
              leftIcon={<Home className="w-4 h-4 text-slate-400" />}
            >
              Voltar para o Início
            </Button>
          </Link>

          <Link to="/explorar" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full sm:w-auto text-xs h-10 font-bold shadow-md shadow-teal-500/20 cursor-pointer"
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Explorar Barbearias
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
