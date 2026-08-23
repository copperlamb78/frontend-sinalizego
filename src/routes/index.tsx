import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ClientLayout } from '@/layouts/ClientLayout';
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageSkeleton } from '@/components/common/PageSkeleton';
import { Role } from '@/types/auth.types';

import { ServerErrorPage } from '@/pages/public/ServerErrorPage';

// Lazy loaded public pages
const HomePage = lazy(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })));
const StorefrontPage = lazy(() => import('@/pages/public/StorefrontPage').then(m => ({ default: m.StorefrontPage })));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy loaded booking & Pix flow pages
const CheckoutPage = lazy(() => import('@/pages/booking/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const PixPaymentPage = lazy(() => import('@/pages/booking/PixPaymentPage').then(m => ({ default: m.PixPaymentPage })));
const BookingSuccessPage = lazy(() => import('@/pages/booking/BookingSuccessPage').then(m => ({ default: m.BookingSuccessPage })));

// Lazy loaded auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const CompanyOnboardingPage = lazy(() => import('@/pages/auth/CompanyOnboardingPage').then(m => ({ default: m.CompanyOnboardingPage })));

// Lazy loaded client pages
const ClientExplorePage = lazy(() => import('@/pages/client/ClientExplorePage').then(m => ({ default: m.ClientExplorePage })));
const ClientAppointmentsPage = lazy(() => import('@/pages/client/ClientAppointmentsPage').then(m => ({ default: m.ClientAppointmentsPage })));
const ClientProfilePage = lazy(() => import('@/pages/client/ClientProfilePage').then(m => ({ default: m.ClientProfilePage })));

// Lazy loaded owner pages
const OwnerDashboardPage = lazy(() => import('@/pages/owner/OwnerDashboardPage').then(m => ({ default: m.OwnerDashboardPage })));
const OwnerCalendarPage = lazy(() => import('@/pages/owner/OwnerCalendarPage').then(m => ({ default: m.OwnerCalendarPage })));
const OwnerServicesPage = lazy(() => import('@/pages/owner/OwnerServicesPage').then(m => ({ default: m.OwnerServicesPage })));
const OwnerWorkingHoursPage = lazy(() => import('@/pages/owner/OwnerWorkingHoursPage').then(m => ({ default: m.OwnerWorkingHoursPage })));
const OwnerFinancialPage = lazy(() => import('@/pages/owner/OwnerFinancialPage').then(m => ({ default: m.OwnerFinancialPage })));
const OwnerSettingsPage = lazy(() => import('@/pages/owner/OwnerSettingsPage').then(m => ({ default: m.OwnerSettingsPage })));

// Lazy loaded admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminCompaniesPage = lazy(() => import('@/pages/admin/AdminCompaniesPage').then(m => ({ default: m.AdminCompaniesPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public Routes (Storefront & Booking Flow)
      {
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: withSuspense(HomePage)
          },
          {
            path: 'empresa/:slug',
            element: withSuspense(StorefrontPage)
          },
          {
            path: 'reserva/:companyId/:serviceId',
            element: withSuspense(CheckoutPage)
          },
          {
            path: 'pagamento/pix/:appointmentId',
            element: withSuspense(PixPaymentPage)
          },
          {
            path: 'reserva/confirmada/:appointmentId',
            element: withSuspense(BookingSuccessPage)
          }
        ]
      },

      // Auth Routes
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: withSuspense(LoginPage)
          },
          {
            path: 'cadastro',
            element: withSuspense(RegisterPage)
          },
          {
            path: 'esqueci-minha-senha',
            element: withSuspense(ForgotPasswordPage)
          },
          {
            path: 'redefinir-senha',
            element: withSuspense(ResetPasswordPage)
          },
          {
            path: 'onboarding/empresa',
            element: withSuspense(CompanyOnboardingPage)
          }
        ]
      },

      // Client Portal (Protected)
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
                path: 'explorar',
                element: withSuspense(ClientExplorePage)
              },
              {
                path: 'meus-agendamentos',
                element: withSuspense(ClientAppointmentsPage)
              },
              {
                path: 'meus-agendamentos/:id',
                element: withSuspense(ClientAppointmentsPage)
              },
              {
                path: 'minha-conta',
                element: withSuspense(ClientProfilePage)
              }
            ]
          }
        ]
      },

      // Owner Portal (Protected)
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
                element: withSuspense(OwnerDashboardPage)
              },
              {
                path: 'agenda',
                element: withSuspense(OwnerCalendarPage)
              },
              {
                path: 'servicos',
                element: withSuspense(OwnerServicesPage)
              },
              {
                path: 'expediente',
                element: withSuspense(OwnerWorkingHoursPage)
              },
              {
                path: 'financeiro',
                element: withSuspense(OwnerFinancialPage)
              },
              {
                path: 'configuracoes',
                element: withSuspense(OwnerSettingsPage)
              }
            ]
          }
        ]
      },

      // Super Admin Portal (Protected)
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
                element: withSuspense(AdminDashboardPage)
              },
              {
                path: 'empresas',
                element: withSuspense(AdminCompaniesPage)
              },
              {
                path: 'empresas/:id',
                element: withSuspense(AdminCompaniesPage)
              },
              {
                path: 'usuarios',
                element: withSuspense(AdminUsersPage)
              }
            ]
          }
        ]
      },

      // 500 Server Error
      {
        path: '500',
        element: <ServerErrorPage />
      },

      // 404 Catch-all
      {
        path: '*',
        element: withSuspense(NotFoundPage)
      }
    ]
  }
]);
