
import React from 'react';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkCheckerState } from '@/hooks/link-checker/types';
import ScannerIdle from './ScannerIdle';
import ScanProgress from './ScanProgress';
import ScanResults from './ScanResults';

interface SiteScannerProps {
  linkChecker: LinkCheckerState & {
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
  const handleExportCsv = () => {
    if (linkChecker.brokenLinks.length > 0) {
      // Prepare data for CSV export
      const csvData = linkChecker.brokenLinks.map(link => ({
        source: link.source || '',
        url: link.url,
        status: link.status,
        statusText: link.statusText || ''
      }));
      
      // Convert to CSV
      const headers = ['Source Page', 'Broken URL', 'Status Code', 'Status Message'];
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => [
          `"${row.source.replace(/"/g, '""')}"`, 
          `"${row.url.replace(/"/g, '""')}"`, 
          row.status, 
          `"${row.statusText.replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `broken-links-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Show the idle state when not scanning and no results
  if (!linkChecker.isChecking && linkChecker.brokenLinks.length === 0 && !linkChecker.isSiteScanning) {
    return <ScannerIdle onStartScan={linkChecker.scanSiteLinks} onStartPageScan={onStartPageScan} />;
  }

  return (
    <>
      <CardContent className="pb-3">
        {linkChecker.isChecking ? (
          <ScanProgress linkChecker={linkChecker} />
        ) : (
          <ScanResults linkChecker={linkChecker} />
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
            onClick={handleExportCsv} 
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
          {linkChecker.isChecking ? 'Scanning...' : 'Scan Again'}
        </Button>
      </CardFooter>
    </>
  );
};

export default SiteScanner;
