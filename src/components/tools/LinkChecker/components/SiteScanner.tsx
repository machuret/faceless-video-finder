
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';

interface SiteScannerProps {
  onStartPageScan: () => void;
}

const SiteScanner: React.FC<SiteScannerProps> = ({ onStartPageScan }) => {
  return (
    <CardContent className="py-6">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <Globe className="h-12 w-12 text-gray-400" />
        <div>
          <h3 className="text-lg font-medium">Site-wide Link Check</h3>
          <p className="text-sm text-gray-500 mt-1">
            This feature checks all links across your site by scanning each page.
          </p>
        </div>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-left max-w-md">
          <p className="text-amber-700 text-sm">
            Coming Soon: Our site-wide scanner is under development. For now, use the Current Page checker to scan individual pages.
          </p>
        </div>
        <Button 
          onClick={onStartPageScan}
          className="mt-2"
        >
          Start with Current Page
        </Button>
      </div>
    </CardContent>
  );
};

export default SiteScanner;
