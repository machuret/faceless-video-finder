
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface ScannerIdleProps {
  onStartScan: () => void;
  onStartPageScan: () => void;
}

const ScannerIdle: React.FC<ScannerIdleProps> = ({ onStartScan, onStartPageScan }) => {
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
        <div className="space-y-2 w-full max-w-md">
          <Button 
            onClick={onStartScan} 
            className="w-full"
          >
            Start Site-wide Scan
          </Button>
          <Button 
            onClick={onStartPageScan}
            variant="outline" 
            className="w-full"
          >
            Just Check Current Page
          </Button>
        </div>
      </div>
    </CardContent>
  );
};

export default ScannerIdle;
