import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { StorefrontPage } from './pages/storefront/StorefrontPage';
import { NotFoundPage } from './pages/not-found/NotFoundPage';

/**
 * Configuração declarativa das rotas da aplicação (React Router v7)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
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
