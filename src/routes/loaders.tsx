
import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Create a proper loading component
export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-sm text-muted-foreground">Loading page...</p>
  </div>
);

// HOC to wrap lazy components with suspense
export const lazyLoad = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);
