
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Globe, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import BrokenLinksTable from './BrokenLinksTable';
import { toast } from 'sonner';

interface SiteScannerProps {
  linkChecker: {
    isChecking: boolean;
    progress: number;
    brokenLinks: any[];
    checkedCount: number;
    totalLinks: number;
    pagesScanned: number;
    totalPages: number;
    isSiteScanning: boolean;
    scanSiteLinks: () => void;
  };
  onReset: () => void;
  onStartPageScan: () => void;
}

const SiteScanner: React.FC<SiteScannerProps> = ({ 
  linkChecker, 
  onReset, 
  onStartPageScan 
}) => {
  const handleExport = () => {
    if (linkChecker.brokenLinks.length === 0) {
      toast.error("No broken links to export");
      return;
    }
    
    const csvContent = [
      ["URL", "Link Text", "Found On", "Status", "Error"],
      ...linkChecker.brokenLinks.map(link => [
        link.url,
        link.text || "",
        link.pageUrl || "",
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
    link.setAttribute('download', `site-broken-links-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Exported broken links to CSV");
  };

  if (!linkChecker.isChecking && linkChecker.brokenLinks.length === 0 && !linkChecker.isSiteScanning) {
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
              onClick={linkChecker.scanSiteLinks} 
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
  }

  return (
    <>
      <CardContent className="pb-3">
        {linkChecker.isChecking && (
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
              {linkChecker.isSiteScanning ? (
                <p className="text-gray-500 mt-1">
                  Scanned {linkChecker.pagesScanned} pages and checked {linkChecker.totalLinks} links site-wide.
                </p>
              ) : (
                <p className="text-gray-500 mt-1">
                  Checked {linkChecker.totalLinks} links on this page.
                </p>
              )}
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
          onClick={linkChecker.scanSiteLinks} 
          disabled={linkChecker.isChecking}
          className="flex-1"
        >
          Scan Again
        </Button>
      </CardFooter>
    </>
  );
};

export default SiteScanner;
