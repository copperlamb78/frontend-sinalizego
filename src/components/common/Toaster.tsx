import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const Toaster: React.FC = () => {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      toastOptions={{
        className: 'bg-[#1E293B] text-[#F8FAFC] border border-slate-700 shadow-xl rounded-xl',
        descriptionClassName: 'text-[#94A3B8]',
        duration: 4000
      }}
    />
  );
};
