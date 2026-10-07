import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout, RegisterForm, RegisterCompanyForm } from '@/features/auth';
import { User, Scissors } from 'lucide-react';

interface RegisterPageProps {
  defaultTab?: 'client' | 'company';
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ defaultTab = 'client' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detecta se a rota acessada foi /cadastro/empresa ou possui ?tipo=empresa
  const isCompanyRoute =
    location.pathname.includes('/empresa') ||
    searchParams.get('tipo') === 'empresa' ||
    defaultTab === 'company';

  const [activeTab, setActiveTab] = useState<'client' | 'company'>(
    isCompanyRoute ? 'company' : 'client'
  );

  useEffect(() => {
    if (location.pathname.includes('/empresa') || searchParams.get('tipo') === 'empresa') {
      setActiveTab('company');
    } else if (location.pathname === '/cadastro' && !searchParams.get('tipo')) {
      setActiveTab('client');
    }
  }, [location.pathname, searchParams]);

  const handleTabChange = (tab: 'client' | 'company') => {
    setActiveTab(tab);
    if (tab === 'company') {
      navigate('/cadastro/empresa', { replace: true });
    } else {
      navigate('/cadastro', { replace: true });
    }
  };

  const title =
    activeTab === 'company'
      ? 'Cadastre seu estabelecimento'
      : 'Crie sua conta de cliente';

  const subtitle =
    activeTab === 'company'
      ? 'Crie a vitrine online da sua barbearia ou salão e receba sinais via Pix com zero no-show.'
      : 'Cadastre-se em segundos para agendar seus serviços favoritos com horário garantido.';

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      maxWidth={activeTab === 'company' ? '2xl' : 'md'}
    >
      {/* SELETOR DE PERFIL: CLIENTE OU ESTABELECIMENTO */}
      <div className="mb-6 p-1 rounded-lg bg-surface-raised border border-border flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleTabChange('client')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'client'
              ? 'bg-surface text-primary shadow-xs border border-border/80'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          data-testid="tab-register-client"
        >
          <User className="h-3.5 w-3.5 shrink-0" />
          <span>Para Você (Cliente)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('company')}
          className={`flex-1 py-2 px-3 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'company'
              ? 'bg-surface text-primary shadow-xs border border-border/80'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          data-testid="tab-register-company"
        >
          <Scissors className="h-3.5 w-3.5 shrink-0" />
          <span>Para Seu Negócio</span>
        </button>
      </div>

      {activeTab === 'client' ? <RegisterForm /> : <RegisterCompanyForm />}
    </AuthLayout>
  );
};
