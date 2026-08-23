import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const Toaster: React.FC = () => {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className: 'bg-[#1E293B] text-[#F8FAFC] border border-slate-700 shadow-2xl rounded-2xl p-4 font-sans',
        descriptionClassName: 'text-[#94A3B8] text-xs',
        duration: 4000
      }}
    />
  );
};
