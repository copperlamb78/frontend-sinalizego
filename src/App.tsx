import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/design-system';
import { router } from '@/routes';

/**
 * Shell Principal da Aplicação SinalizeGO
 * Conecta os Provedores Globais, Toaster e o Router Declarativo
 */
export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      <Toaster position="bottom-right" />
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
