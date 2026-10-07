import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { ForClientsPage } from './pages/for-clients/ForClientsPage';
import { BarberPage } from './pages/barber/BarberPage';
import { StorefrontPage } from './pages/storefront/StorefrontPage';
import { NotFoundPage } from './pages/not-found/NotFoundPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

/**
 * Configuração declarativa das rotas da aplicação (React Router v7)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/cadastro',
    element: <RegisterPage defaultTab="client" />,
  },
  {
    path: '/cadastro/empresa',
    element: <RegisterPage defaultTab="company" />,
  },
  {
    path: '/cadastro-empresa',
    element: <Navigate to="/cadastro/empresa" replace />,
  },
  {
    path: '/registro',
    element: <Navigate to="/cadastro" replace />,
  },
  {
    path: '/para-clientes',
    element: <ForClientsPage />,
  },
  {
    path: '/para-barbearias',
    element: <BarberPage />,
  },
  {
    path: '/empresa/:slug',
    element: <StorefrontPage />,
  },
  {
    path: '/b/:slug',
    element: <StorefrontPage />,
  },
  {
    path: '/vitrine',
    element: <Navigate to="/empresa/barbers-club" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
