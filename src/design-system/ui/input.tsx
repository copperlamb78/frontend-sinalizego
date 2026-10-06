import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerClassName?: string;
  'data-testid'?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      rightAction,
      id,
      disabled,
      'data-testid': testId = 'form-input',
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-text-primary select-none"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'group relative flex items-center h-11 w-full rounded-[4px] border bg-surface transition-all duration-150',
            hasError
              ? 'border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20'
              : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            disabled && 'opacity-60 bg-surface-raised cursor-not-allowed'
          )}
        >
          {leftIcon && (
            <div className="pl-3.5 pr-1 flex items-center justify-center text-text-muted shrink-0 pointer-events-none group-focus-within:text-primary transition-colors">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            data-testid={testId}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={cn(
              'h-full w-full bg-transparent px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed',
              leftIcon && 'pl-2',
              (rightIcon || rightAction) && 'pr-2',
              className
            )}
            {...props}
          />

          {rightAction ? (
            <div className="pr-2 flex items-center shrink-0">{rightAction}</div>
          ) : rightIcon ? (
            <div className="pr-3.5 flex items-center justify-center text-text-muted shrink-0 pointer-events-none group-focus-within:text-text-primary transition-colors">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {hasError ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1 text-xs font-semibold text-danger animate-in fade-in"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
