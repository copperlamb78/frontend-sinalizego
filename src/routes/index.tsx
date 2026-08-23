import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ClientLayout } from '@/layouts/ClientLayout';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types/auth.types';

// Public pages
import { HomePage } from '@/pages/public/HomePage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { CompanyOnboardingPage } from '@/pages/auth/CompanyOnboardingPage';

// Client pages
import { ClientAppointmentsPage } from '@/pages/client/ClientAppointmentsPage';
import { ClientProfilePage } from '@/pages/client/ClientProfilePage';

// Owner pages
import { OwnerDashboardPage } from '@/pages/owner/OwnerDashboardPage';
import { OwnerCalendarPage } from '@/pages/owner/OwnerCalendarPage';
import { OwnerServicesPage } from '@/pages/owner/OwnerServicesPage';
import { OwnerWorkingHoursPage } from '@/pages/owner/OwnerWorkingHoursPage';
import { OwnerFinancialPage } from '@/pages/owner/OwnerFinancialPage';
import { OwnerSettingsPage } from '@/pages/owner/OwnerSettingsPage';

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminCompaniesPage } from '@/pages/admin/AdminCompaniesPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // 🌐 Public Routes
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <HomePage />
          },
          {
            path: 'empresa/:slug',
            element: <HomePage /> // Storefront will be built in Task 2
          },
          {
            path: 'reserva/:companyId/:serviceId',
            element: <HomePage /> // Checkout booking will be built in Task 2
          },
          {
            path: 'pagamento/pix/:appointmentId',
            element: <HomePage /> // Pix Payment will be built in Task 2
          },
          {
            path: 'reserva/confirmada/:appointmentId',
            element: <HomePage /> // Confirmation voucher will be built in Task 2
          }
        ]
      },

      // 🔐 Auth Routes
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />
          },
          {
            path: 'cadastro',
            element: <RegisterPage />
          },
          {
            path: 'esqueci-minha-senha',
            element: <ForgotPasswordPage />
          },
          {
            path: 'redefinir-senha',
            element: <ResetPasswordPage />
          },
          {
            path: 'onboarding/empresa',
            element: <CompanyOnboardingPage />
          }
        ]
      },

      // 👤 Client Portal (Protected)
      {
        element: (
          <ProtectedRoute
            allowedRoles={[
              Role.CLIENT,
              Role.COMPANY_OWNER,
              Role.EMPLOYEE,
              Role.ADMIN,
              Role.SUPER_ADMIN
            ]}
          />
        ),
        children: [
          {
            element: <ClientLayout />,
            children: [
              {
                path: 'meus-agendamentos',
                element: <ClientAppointmentsPage />
              },
              {
                path: 'meus-agendamentos/:id',
                element: <ClientAppointmentsPage />
              },
              {
                path: 'minha-conta',
                element: <ClientProfilePage />
              }
            ]
          }
        ]
      },

      // 💈 Owner Portal (Protected)
      {
        path: 'painel',
        element: (
          <ProtectedRoute
            allowedRoles={[
              Role.COMPANY_OWNER,
              Role.ADMIN,
              Role.SUPER_ADMIN
            ]}
          />
        ),
        children: [
          {
            element: <OwnerLayout />,
            children: [
              {
                index: true,
                element: <OwnerDashboardPage />
              },
              {
                path: 'agenda',
                element: <OwnerCalendarPage />
              },
              {
                path: 'servicos',
                element: <OwnerServicesPage />
              },
              {
                path: 'expediente',
                element: <OwnerWorkingHoursPage />
              },
              {
                path: 'financeiro',
                element: <OwnerFinancialPage />
              },
              {
                path: 'configuracoes',
                element: <OwnerSettingsPage />
              }
            ]
          }
        ]
      },

      // 🛡️ Super Admin Portal (Protected)
      {
        path: 'admin',
        element: (
          <ProtectedRoute
            allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
          />
        ),
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboardPage />
              },
              {
                path: 'empresas',
                element: <AdminCompaniesPage />
              },
              {
                path: 'empresas/:id',
                element: <AdminCompaniesPage />
              },
              {
                path: 'usuarios',
                element: <AdminUsersPage />
              }
            ]
          }
        ]
      },

      // 404 Catch-all
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
