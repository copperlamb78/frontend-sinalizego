import React from 'react';
import { AuthLayout, RegisterForm } from '@/features/auth';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Crie sua conta gratuita"
      subtitle="Cadastre-se em segundos para agendar seus serviços com sinal Pix garantido."
    >
      <RegisterForm />
    </AuthLayout>
  );
};
