import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer select-none rounded-xl';

    const variants = {
      primary:
        'bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-lg shadow-teal-950/40 border border-teal-400/20 font-semibold',
      secondary:
        'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-slate-700/60 shadow-sm',
      outline:
        'border border-slate-700 bg-transparent hover:bg-[#1E293B]/60 text-[#F8FAFC] hover:border-slate-500',
      ghost:
        'bg-transparent hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]',
      destructive:
        'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-red-950/40 border border-red-400/20 font-semibold'
    };

    const sizes = {
      sm: 'text-xs h-9 px-3.5 gap-1.5',
      md: 'text-sm h-11 px-5 gap-2',
      lg: 'text-base h-13 px-6 gap-2.5',
      icon: 'h-10 w-10 p-0'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0 mr-1.5" />
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
