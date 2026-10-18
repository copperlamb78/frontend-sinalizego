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
    // Classes base limpas, ergonômicas e com alinhamento flex horizontal garantido
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap select-none font-semibold text-sm rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98] [&>svg]:shrink-0';

    // Variantes sólidas, limpas e com alto contraste certificado (WCAG AAA)
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary-hover border border-transparent shadow-xs',
      secondary:
        'bg-surface text-text-primary border border-border hover:bg-surface-raised hover:border-border-strong shadow-xs',
      outline:
        'bg-transparent text-text-primary border border-border hover:bg-surface-raised hover:border-border-strong',
      danger:
        'bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white',
      ghost:
        'bg-transparent text-text-secondary hover:bg-surface-raised hover:text-text-primary',
      link:
        'bg-transparent text-primary hover:underline p-0 h-auto font-medium',
    };

    // Tamanhos ergonômicos e proporcionais
    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-9 px-3 text-xs gap-1.5 rounded-md',
      md: 'h-10 px-4 text-sm gap-2 rounded-md',
      lg: 'h-12 px-6 text-base gap-2.5 rounded-lg',
      icon: 'h-10 w-10 p-0 rounded-md',
      'icon-sm': 'h-8 w-8 p-0 rounded-md',
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
            {loadingText ? <span>{loadingText}</span> : children}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
