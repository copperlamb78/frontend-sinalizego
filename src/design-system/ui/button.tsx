import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/core/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  'data-testid'?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      'data-testid': testId = 'action-button',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Classes base limpas e sóbrias sem efeitos neon ou sombras brilhantes
    const baseStyles =
      'inline-flex items-center justify-center select-none font-bold uppercase tracking-wider rounded-[4px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    // Variantes sólidas, limpas e com contraste equilibrado
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-primary text-white hover:bg-primary-hover border border-transparent',
      secondary:
        'bg-surface text-text-primary border border-border hover:bg-surface-raised',
      outline:
        'bg-transparent text-text-primary border border-border hover:bg-surface-raised hover:border-text-secondary',
      danger:
        'bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white',
      ghost:
        'bg-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary',
      link:
        'bg-transparent text-primary hover:underline p-0 h-auto tracking-normal font-semibold normal-case',
    };

    // Tamanhos ergonômicos
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-11 px-4 text-xs gap-2',
      lg: 'h-13 px-6 text-sm gap-2.5',
      icon: 'h-11 w-11 p-0',
      'icon-sm': 'h-9 w-9 p-0',
    };

    const isButtonDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        data-testid={testId}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
