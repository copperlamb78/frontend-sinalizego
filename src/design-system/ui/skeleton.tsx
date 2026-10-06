import React from 'react';
import { cn } from '@/core/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  'data-testid': testId = 'ui-skeleton',
  ...props
}) => {
  return (
    <div
      data-testid={testId}
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-[3px] bg-surface-raised border border-border/40',
        className
      )}
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';
