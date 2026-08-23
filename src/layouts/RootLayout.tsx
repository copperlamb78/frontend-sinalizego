import React from 'react';
import { Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/query-client';
import { AuthProvider } from '@/contexts/auth.context';
import { Toaster } from '@/components/common/Toaster';

export const RootLayout: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#14B8A6] selection:text-white">
          <Outlet />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
};
