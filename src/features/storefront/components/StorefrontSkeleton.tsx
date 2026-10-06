import React from 'react';
import { Skeleton } from '@/design-system/ui/skeleton';
import { Card, CardContent } from '@/design-system/ui/card';

export const StorefrontSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12" data-testid="storefront-skeleton">
      {/* Skeleton do Header */}
      <div className="space-y-4">
        <Skeleton className="h-44 sm:h-52 w-full rounded-none" />

        <div className="px-4 sm:px-6 space-y-4">
          <div className="flex items-end justify-between -mt-12 sm:-mt-14">
            <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-border" />
            <Skeleton className="h-9 w-36" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-44" />
          </div>
        </div>
      </div>

      {/* Skeleton do Catálogo */}
      <div className="px-4 sm:px-6 space-y-4">
        {/* Abas */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Cards de Serviço */}
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
