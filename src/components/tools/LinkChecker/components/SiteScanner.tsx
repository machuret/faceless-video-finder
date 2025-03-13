
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Globe, Loader2, FileDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import BrokenLinksTable from './BrokenLinksTable';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ScannedPage {
  url: string;
  linkCount: number;
  brokenCount: number;
  status: 'success' | 'error' | 'pending';
}

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
    scannedPages: ScannedPage[];
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
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `site-scan-report-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Exported full site scan report");
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
            </div>
            
            {linkChecker.brokenLinks.length > 0 && (
              <BrokenLinksTable brokenLinks={linkChecker.brokenLinks} />
            )}
            
            {linkChecker.scannedPages && linkChecker.scannedPages.length > 0 && (
              <div className="mt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="scanned-pages">
                    <AccordionTrigger className="text-sm font-medium">
                      Pages Scanned ({linkChecker.scannedPages.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="max-h-64 overflow-y-auto border rounded-md mt-2">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {linkChecker.scannedPages.map((page, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-3 py-2">
                                  <div className="truncate max-w-xs">
                                    <a 
                                      href={page.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {page.url.replace(window.location.origin, '')}
                                    </a>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {page.linkCount} {page.brokenCount > 0 && (
                                    <span className="text-red-500 ml-1">({page.brokenCount} broken)</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {page.status === 'success' ? (
                                    <span className="text-green-600">✓</span>
                                  ) : page.status === 'error' ? (
                                    <span className="text-red-500">✕</span>
                                  ) : (
                                    <span className="text-yellow-500">...</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
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
