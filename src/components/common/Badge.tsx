import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'success' | 'destructive' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    destructive: 'bg-red-500/10 text-red-300 border-red-500/30',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    info: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const dotColors = {
    teal: 'bg-teal-400',
    success: 'bg-emerald-400',
    destructive: 'bg-red-400',
    warning: 'bg-amber-400',
    info: 'bg-sky-400',
    neutral: 'bg-slate-400'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-semibold'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border tracking-wide select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};
