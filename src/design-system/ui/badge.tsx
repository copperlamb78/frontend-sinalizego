import React from 'react';
import { cn } from '@/core/utils/cn';

export type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
export type BadgeSize = 'sm' | 'md';
export type BadgeShape = 'pill' | 'square';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  dot?: boolean;
  icon?: React.ReactNode;
  'data-testid'?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  shape = 'square',
  dot = false,
  icon,
  children,
  'data-testid': testId = 'status-badge',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-semibold tracking-wide text-xs select-none transition-colors border';

  // Acabamento fosco, neutro e sóbrio — ZERO neon / ZERO saturação artificial de IA
  const variantStyles: Record<BadgeVariant, string> = {
    brand:
      'bg-surface-raised text-text-primary border-border',
    success:
      'bg-surface-raised text-text-primary border-border',
    warning:
      'bg-surface-raised text-text-primary border-border',
    danger:
      'bg-surface-raised text-text-primary border-border',
    neutral:
      'bg-surface-raised text-text-secondary border-border',
    outline:
      'bg-transparent text-text-secondary border-border',
  };

  // Dots discretos e sóbrios de 5px (indicadores cirúrgicos de status)
  const dotStyles: Record<BadgeVariant, string> = {
    brand: 'bg-primary',
    success: 'bg-emerald-600 dark:bg-emerald-500',
    warning: 'bg-amber-600 dark:bg-amber-500',
    danger: 'bg-red-600 dark:bg-red-500',
    neutral: 'bg-text-muted',
    outline: 'bg-text-secondary',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  };

  const shapeStyles: Record<BadgeShape, string> = {
    pill: 'rounded-full',
    square: 'rounded-[3px]',
  };

  return (
    <span
      data-testid={testId}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        shapeStyles[shape],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </span>
  );
};

Badge.displayName = 'Badge';
