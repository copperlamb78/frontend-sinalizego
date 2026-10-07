import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/design-system';
import { router } from '@/routes';
import { AuthProvider } from '@/features/auth';

/**
 * Shell Principal da Aplicação SinalizeGO
 * Conecta o AuthProvider, Toaster e o Router Declarativo
 */
export const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
        <Toaster position="bottom-right" />
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
};

export default App;
