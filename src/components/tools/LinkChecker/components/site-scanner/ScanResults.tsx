
import React from 'react';
import { LinkCheckerState } from '@/hooks/link-checker/types';
import BrokenLinksTable from '../BrokenLinksTable';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import ScannedPagesAccordion from './ScannedPagesAccordion';

interface ScanResultsProps {
  linkChecker: LinkCheckerState;
}

const ScanResults: React.FC<ScanResultsProps> = ({ linkChecker }) => {
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
    
    downloadCsv(csvContent, `site-broken-links-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Exported broken links to CSV");
  };

  const exportFullReport = () => {
    // Create a comprehensive report of all pages and links
    const csvContent = [
      ["Page URL", "Total Links", "Broken Links", "Status"],
      ...linkChecker.scannedPages.map(page => [
        page.url,
        String(page.linkCount),
        String(page.brokenCount),
        page.status
      ])
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    downloadCsv(csvContent, `site-scan-report-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("Exported full site scan report");
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mb-4">
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
        <div className="text-gray-600 mt-2 space-y-1">
          <p>
            Scanned {linkChecker.pagesScanned} pages and checked {linkChecker.totalLinks} links site-wide.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 py-0 text-xs flex items-center gap-1"
              onClick={exportFullReport}
            >
              <FileDown className="h-3 w-3" /> Export Full Report
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mt-1">
          Checked {linkChecker.totalLinks} links on this page.
        </p>
      )}
      
      {linkChecker.brokenLinks.length > 0 && (
        <>
          <div className="mt-4">
            <BrokenLinksTable brokenLinks={linkChecker.brokenLinks} />
          </div>
          <div className="mt-2 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 py-0 text-xs flex items-center gap-1"
              onClick={handleExport}
            >
              <FileDown className="h-3 w-3" /> Export Broken Links
            </Button>
          </div>
        </>
      )}
      
      {linkChecker.scannedPages && linkChecker.scannedPages.length > 0 && (
        <div className="mt-6">
          <ScannedPagesAccordion scannedPages={linkChecker.scannedPages} />
        </div>
      )}
    </div>
  );
};

export default ScanResults;
