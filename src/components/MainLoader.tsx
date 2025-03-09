
import React from 'react';
import { Loader2 } from 'lucide-react';

const MainLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};

export default MainLoader;
