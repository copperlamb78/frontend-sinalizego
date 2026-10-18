import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { ForClientsPage } from './pages/for-clients/ForClientsPage';
import { BarberPage } from './pages/barber/BarberPage';
import { StorefrontPage } from './pages/storefront/StorefrontPage';
import { NotFoundPage } from './pages/not-found/NotFoundPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PaymentPage } from './pages/checkout/PaymentPage';
import { ExploreBarbershopsPage } from './pages/client/ExploreBarbershopsPage';
import { MyAppointmentsPage } from './pages/client/MyAppointmentsPage';
import { MyCreditsPage } from './pages/client/MyCreditsPage';
import { MyProfilePage } from './pages/client/MyProfilePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

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
    path: '/barbearias',
    element: <ExploreBarbershopsPage />,
  },
  {
    path: '/explorar',
    element: <Navigate to="/barbearias" replace />,
  },
  {
    path: '/meus-agendamentos',
    element: (
      <ProtectedRoute>
        <MyAppointmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/meus-creditos',
    element: (
      <ProtectedRoute>
        <MyCreditsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <MyProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/minha-conta',
    element: <Navigate to="/meus-agendamentos" replace />,
  },
  {
    path: '/minha-conta/agendamentos',
    element: <Navigate to="/meus-agendamentos" replace />,
  },
  {
    path: '/minha-conta/perfil',
    element: <Navigate to="/perfil" replace />,
  },
  {
    path: '/painel',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/painel/:tab',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/estabelecimento',
    element: <Navigate to="/painel" replace />,
  },
  {
    path: '/dashboard',
    element: <Navigate to="/painel" replace />,
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
    path: '/pagamento/:appointmentId',
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/checkout/:appointmentId',
    element: <Navigate to="/pagamento/:appointmentId" replace />,
  },
  {
    path: '/vitrine',
    element: <Navigate to="/barbearias" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
