import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Role } from '@/types/auth.types';
import { Loader2, ShieldAlert, Store, LogIn } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading, loginAsDemoOwner } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1120] text-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin" />
          <p className="text-sm text-[#94A3B8] font-medium tracking-wide">
            Carregando sessão segura...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, provide friendly demo login option or redirect to login
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-6">
        <div className="max-w-md w-full rounded-3xl bg-[#0F172A] border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Store className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Área Restrita do Estabelecimento</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Você precisa estar autenticado como Dono do Estabelecimento para acessar o Painel de Gestão.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              className="w-full h-12 text-sm font-bold shadow-lg shadow-teal-500/20"
              onClick={() => loginAsDemoOwner()}
              leftIcon={<Store className="w-4 h-4" />}
            >
              Entrar como Dono (Modo Demonstração)
            </Button>

            <Button
              variant="outline"
              className="w-full h-11 text-xs font-semibold"
              onClick={() => (window.location.href = '/login')}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Fazer Login com Minha Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-6">
        <div className="max-w-md w-full rounded-2xl bg-[#0F172A] border border-red-500/30 p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Acesso Não Autorizado</h2>
            <p className="text-sm text-[#94A3B8]">
              Seu perfil (<span className="text-teal-400 font-mono">{user.role}</span>) não possui permissão para acessar esta área restrita.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user.role === Role.CLIENT && (
              <Button onClick={() => (window.location.href = '/meus-agendamentos')}>
                Ir para Meus Agendamentos
              </Button>
            )}
            {user.role === Role.COMPANY_OWNER && (
              <Button onClick={() => (window.location.href = '/painel')}>
                Ir para o Painel do Dono
              </Button>
            )}
            {(user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) && (
              <Button onClick={() => (window.location.href = '/admin')}>
                Ir para Área Administrativa
              </Button>
            )}
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
