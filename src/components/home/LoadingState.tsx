
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const LoadingState = () => {
  // Create an array of 6 items to show a grid of skeletons
  const skeletonCount = 6;
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => i);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
            {/* Skeleton for channel image */}
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-3">
              {/* Skeleton for channel title */}
              <Skeleton className="h-6 w-3/4" />
              {/* Skeleton for stats */}
              <div className="flex space-x-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              {/* Skeleton for description */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              {/* Skeleton for tags */}
              <div className="flex space-x-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured videos skeleton */}
      <div className="mt-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-gray-200">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-4/5" />
                <div className="flex space-x-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
