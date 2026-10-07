import React from 'react';
import { AuthLayout, LoginForm } from '@/features/auth';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Acesse sua conta"
      subtitle="Entre com suas credenciais para gerenciar seus agendamentos e serviços."
    >
      <LoginForm />
    </AuthLayout>
  );
};
