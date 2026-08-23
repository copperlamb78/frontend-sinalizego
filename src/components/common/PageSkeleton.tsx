import React from 'react';
import { Skeleton } from '@/components/common/Skeleton';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-[60vh] max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header bar skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

      {/* Main card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>

      {/* Large content block skeleton */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  );
};
