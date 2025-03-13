
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { LinkCheckerState } from '@/hooks/link-checker/types';

interface ScanProgressProps {
  linkChecker: LinkCheckerState;
}

const ScanProgress: React.FC<ScanProgressProps> = ({ linkChecker }) => {
  return (
    <div className="space-y-3 mb-4">
      <div className="flex justify-between items-center text-sm">
        <span>Scanning site...</span>
        <span>{linkChecker.checkedCount} of {linkChecker.totalLinks} links</span>
      </div>
      <Progress value={linkChecker.progress} className="h-2" />
      
      {linkChecker.isSiteScanning && (
        <div className="text-sm text-gray-500 mt-1">
          <div className="flex justify-between">
            <span>Pages scanned:</span>
            <span>{linkChecker.pagesScanned} of {linkChecker.totalPages}</span>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      </div>
    </div>
  );
};

export default ScanProgress;
