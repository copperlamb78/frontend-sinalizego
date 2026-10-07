import React from 'react';
import { Link } from 'react-router-dom';

interface SiteFooterProps {
  isDark: boolean;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ isDark }) => {
  return (
    <footer className="w-full border-t border-border bg-surface py-12 px-4 sm:px-8 text-xs text-text-muted mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 text-left">
        {/* COLUNA 1: IDENTIDADE */}
        <div className="space-y-3 sm:col-span-2">
          <Link to="/" className="inline-block" aria-label="SinalizeGO - Página Inicial">
            <img
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="SinalizeGO"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </Link>
          <p className="text-text-secondary leading-relaxed max-w-sm">
            A infraestrutura de agendamento online com sinal no Pix que elimina o não-comparecimento, protege o faturamento dos profissionais e garante atendimento pontual sem filas para os clientes.
          </p>
        </div>

        {/* COLUNA 2: NAVEGAÇÃO */}
        <div className="space-y-2">
          <h5 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Navegação
          </h5>
          <ul className="space-y-1.5 text-text-secondary">
            <li>
              <Link to="/" className="hover:text-primary transition-colors">
                Apresentação Geral
              </Link>
            </li>
            <li>
              <Link to="/para-clientes" className="hover:text-primary transition-colors">
                Para Clientes
              </Link>
            </li>
            <li>
              <Link to="/para-barbearias" className="hover:text-primary transition-colors">
                Para Barbearias &amp; Salões
              </Link>
            </li>
            <li>
              <Link to="/empresa/barbers-club" className="hover:text-primary transition-colors font-medium text-primary">
                Vitrine Interativa Demo
              </Link>
            </li>
          </ul>
        </div>

        {/* COLUNA 3: SEGURANÇA E CONFORMIDADE */}
        <div className="space-y-2">
          <h5 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Segurança &amp; Pix
          </h5>
          <p className="text-text-secondary leading-relaxed text-[11px]">
            Processamento financeiro seguro via Pix com transferências automatizadas para sua conta bancária. Zero retenção de senhas, hold anti-concorrência de 15 minutos e regras canônicas N1–N7.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p>© {new Date().getFullYear()} SinalizeGO. Todos os direitos reservados.</p>
        <p className="text-text-muted">
          Plataforma canônica de agendamento inteligente com sinal no Pix.
        </p>
      </div>
    </footer>
  );
};
