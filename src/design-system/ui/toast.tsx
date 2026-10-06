import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export interface ToasterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export const Toaster: React.FC<ToasterProps> = ({ position = 'bottom-right' }) => {
  return (
    <SonnerToaster
      position={position}
      richColors={false}
      toastOptions={{
        className:
          'bg-surface text-text-primary border border-border shadow-md rounded-[6px] text-xs font-semibold py-3 px-4',
        style: {
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        },
      }}
    />
  );
};

export const toast = sonnerToast;
