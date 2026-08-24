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

const isChunkLoadError = (error: unknown): boolean => {
  if (!error) return false;
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('chunkloaderror') ||
    message.includes('loading chunk') ||
    message.includes('loading css chunk')
  );
};

// Helper to gracefully retry failed dynamic module imports (e.g. after a new Vercel deployment)
const lazyWithRetry = <T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  chunkKey: string
) =>
  lazy(async () => {
    try {
      const component = await componentImport();
      // Reset retry flag upon successful load
      window.sessionStorage.removeItem(`sinalizego_chunk_retry_${chunkKey}`);
      return component;
    } catch (error) {
      if (isChunkLoadError(error)) {
        const storageKey = `sinalizego_chunk_retry_${chunkKey}`;
        const hasRetried = window.sessionStorage.getItem(storageKey);

        if (!hasRetried) {
          window.sessionStorage.setItem(storageKey, 'true');
          // Clear stale service worker caches if supported
          if ('caches' in window) {
            try {
              const cacheKeys = await window.caches.keys();
              await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
            } catch {
              // Ignore cache deletion error
            }
          }
          window.location.reload();
          return { default: (() => null) as unknown as T };
        }
      }
      // If it's a runtime code error or already retried once, throw directly to GlobalErrorBoundary
      throw error;
    }
  });

// Lazy loaded public pages
const HomePage = lazyWithRetry(() => import('@/pages/public/HomePage').then(m => ({ default: m.HomePage })), 'home');
const StorefrontPage = lazyWithRetry(() => import('@/pages/public/StorefrontPage').then(m => ({ default: m.StorefrontPage })), 'storefront');
const NotFoundPage = lazyWithRetry(() => import('@/pages/public/NotFoundPage').then(m => ({ default: m.NotFoundPage })), 'not-found');

// Lazy loaded booking & Pix flow pages
const CheckoutPage = lazyWithRetry(() => import('@/pages/booking/CheckoutPage').then(m => ({ default: m.CheckoutPage })), 'checkout');
const PixPaymentPage = lazyWithRetry(() => import('@/pages/booking/PixPaymentPage').then(m => ({ default: m.PixPaymentPage })), 'pix-payment');
const BookingSuccessPage = lazyWithRetry(() => import('@/pages/booking/BookingSuccessPage').then(m => ({ default: m.BookingSuccessPage })), 'booking-success');

// Lazy loaded auth pages
const LoginPage = lazyWithRetry(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })), 'login');
const RegisterPage = lazyWithRetry(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })), 'register');
const ForgotPasswordPage = lazyWithRetry(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })), 'forgot-password');
const ResetPasswordPage = lazyWithRetry(() => import('@/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })), 'reset-password');
const CompanyOnboardingPage = lazyWithRetry(() => import('@/pages/auth/CompanyOnboardingPage').then(m => ({ default: m.CompanyOnboardingPage })), 'onboarding');

// Lazy loaded client pages
const ClientExplorePage = lazyWithRetry(() => import('@/pages/client/ClientExplorePage').then(m => ({ default: m.ClientExplorePage })), 'client-explore');
const ClientAppointmentsPage = lazyWithRetry(() => import('@/pages/client/ClientAppointmentsPage').then(m => ({ default: m.ClientAppointmentsPage })), 'client-appointments');
const ClientProfilePage = lazyWithRetry(() => import('@/pages/client/ClientProfilePage').then(m => ({ default: m.ClientProfilePage })), 'client-profile');

// Lazy loaded owner pages
const OwnerDashboardPage = lazyWithRetry(() => import('@/pages/owner/OwnerDashboardPage').then(m => ({ default: m.OwnerDashboardPage })), 'owner-dashboard');
const OwnerCalendarPage = lazyWithRetry(() => import('@/pages/owner/OwnerCalendarPage').then(m => ({ default: m.OwnerCalendarPage })), 'owner-calendar');
const OwnerServicesPage = lazyWithRetry(() => import('@/pages/owner/OwnerServicesPage').then(m => ({ default: m.OwnerServicesPage })), 'owner-services');
const OwnerWorkingHoursPage = lazyWithRetry(() => import('@/pages/owner/OwnerWorkingHoursPage').then(m => ({ default: m.OwnerWorkingHoursPage })), 'owner-working-hours');
const OwnerFinancialPage = lazyWithRetry(() => import('@/pages/owner/OwnerFinancialPage').then(m => ({ default: m.OwnerFinancialPage })), 'owner-financial');
const OwnerSettingsPage = lazyWithRetry(() => import('@/pages/owner/OwnerSettingsPage').then(m => ({ default: m.OwnerSettingsPage })), 'owner-settings');

// Lazy loaded admin pages
const AdminDashboardPage = lazyWithRetry(() => import('@/pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })), 'admin-dashboard');
const AdminCompaniesPage = lazyWithRetry(() => import('@/pages/admin/AdminCompaniesPage').then(m => ({ default: m.AdminCompaniesPage })), 'admin-companies');
const AdminUsersPage = lazyWithRetry(() => import('@/pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })), 'admin-users');

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
