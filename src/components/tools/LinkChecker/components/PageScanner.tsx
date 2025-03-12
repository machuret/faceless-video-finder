
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import BrokenLinksTable from './BrokenLinksTable';

interface PageScannerProps {
  linkChecker: {
    isChecking: boolean;
    progress: number;
    brokenLinks: any[];
    checkedCount: number;
    totalLinks: number;
    scanPageLinks: () => void;
  };
  onReset: () => void;
}

const PageScanner: React.FC<PageScannerProps> = ({ linkChecker, onReset }) => {
  const handleExport = () => {
    if (linkChecker.brokenLinks.length === 0) {
      toast.error("No broken links to export");
      return;
    }
    
    const csvContent = [
      ["URL", "Link Text", "Status", "Error"],
      ...linkChecker.brokenLinks.map(link => [
        link.url,
        link.text || "",
        String(link.status),
        link.error || ""
      ])
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `broken-links-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Exported broken links to CSV");
  };

  return (
    <>
      <CardContent className="pb-3">
        {linkChecker.isChecking && (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span>Scanning links...</span>
              <span>{linkChecker.checkedCount} of {linkChecker.totalLinks}</span>
            </div>
            <Progress value={linkChecker.progress} className="h-2" />
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}
        
        {!linkChecker.isChecking && (
          <>
            <div className="mb-4 text-sm">
              {linkChecker.brokenLinks.length > 0 ? (
                <p className="text-red-500 font-medium">
                  Found {linkChecker.brokenLinks.length} broken {linkChecker.brokenLinks.length === 1 ? 'link' : 'links'}
                </p>
              ) : (
                <p className="text-green-600 font-medium">
                  All links checked! No broken links found.
                </p>
              )}
              <p className="text-gray-500 mt-1">
                Checked {linkChecker.totalLinks} links on this page.
              </p>
            </div>
            
            {linkChecker.brokenLinks.length > 0 && (
              <BrokenLinksTable brokenLinks={linkChecker.brokenLinks} />
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between gap-2">
        <Button 
          variant="outline" 
          onClick={onReset} 
          disabled={linkChecker.isChecking}
          className="flex-1"
        >
          Reset
        </Button>
        
        {linkChecker.brokenLinks.length > 0 && (
          <Button 
            onClick={handleExport} 
            disabled={linkChecker.isChecking}
            variant="secondary"
            className="flex-1"
          >
            Export CSV
          </Button>
        )}
        
        <Button 
          onClick={linkChecker.scanPageLinks} 
          disabled={linkChecker.isChecking}
          className="flex-1"
        >
          Scan Again
        </Button>
      </CardFooter>
    </>
  );
};

export default PageScanner;
