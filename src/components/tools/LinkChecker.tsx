
import React, { useState, useEffect } from 'react';
import { useLinkChecker } from '@/hooks/useLinkChecker';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LinkCheckerProps {
  autoScan?: boolean;
}

export const LinkChecker: React.FC<LinkCheckerProps> = ({ autoScan = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("page");
  const { 
    isChecking, 
    progress, 
    brokenLinks, 
    checkedCount,
    totalLinks,
    scanPageLinks, 
    reset 
  } = useLinkChecker();

  useEffect(() => {
    if (autoScan) {
      scanPageLinks();
    }
  }, [autoScan, scanPageLinks]);

  const handleScanClick = () => {
    setIsExpanded(true);
    scanPageLinks();
  };

  const handleReset = () => {
    reset();
    setIsExpanded(false);
  };

  const handleExport = () => {
    if (brokenLinks.length === 0) {
      toast.error("No broken links to export");
      return;
    }
    
    const csvContent = [
      ["URL", "Link Text", "Status", "Error"],
      ...brokenLinks.map(link => [
        link.url,
        link.text,
        String(link.status),
        link.error || ""
      ])
    ]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "site" && !isChecking) {
      toast.info("Site-wide link checking is initiated from the page view. Check all links on this page first.");
    }
  };

  return (
    <Card className="shadow-md border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
          Link Checker
        </CardTitle>
        <CardDescription>
          Scan for broken links on this page or site-wide
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="page" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="page">Current Page Check</TabsTrigger>
          <TabsTrigger value="site">Site-wide Check</TabsTrigger>
        </TabsList>
        
        <TabsContent value="page">
          {(!isChecking && brokenLinks.length === 0 && !isExpanded) ? (
            <CardFooter className="pt-2">
              <Button 
                onClick={handleScanClick} 
                disabled={isChecking}
                className="w-full"
              >
                Scan for Broken Links
              </Button>
            </CardFooter>
          ) : (
            <>
              <CardContent className="pb-3">
                {isChecking && (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Scanning links...</span>
                      <span>{checkedCount} of {totalLinks}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  </div>
                )}
                
                {!isChecking && (
                  <>
                    <div className="mb-4 text-sm">
                      {brokenLinks.length > 0 ? (
                        <p className="text-red-500 font-medium">
                          Found {brokenLinks.length} broken {brokenLinks.length === 1 ? 'link' : 'links'}
                        </p>
                      ) : (
                        <p className="text-green-600 font-medium">
                          All links checked! No broken links found.
                        </p>
                      )}
                    </div>
                    
                    {brokenLinks.length > 0 && (
                      <div className="max-h-64 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {brokenLinks.map((link, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <div className="font-medium text-gray-900 truncate max-w-xs">{link.url}</div>
                                  <div className="text-gray-500 truncate max-w-xs">{link.text}</div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-red-500">
                                  {link.status || "Error"}
                                  {link.error && <div className="text-xs text-gray-500">{link.error}</div>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  disabled={isChecking}
                  className="flex-1"
                >
                  Reset
                </Button>
                
                {brokenLinks.length > 0 && (
                  <Button 
                    onClick={handleExport} 
                    disabled={isChecking}
                    variant="secondary"
                    className="flex-1"
                  >
                    Export CSV
                  </Button>
                )}
                
                <Button 
                  onClick={scanPageLinks} 
                  disabled={isChecking}
                  className="flex-1"
                >
                  Scan Again
                </Button>
              </CardFooter>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="site">
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <Globe className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium">Site-wide Link Check</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This feature checks all links across your site by scanning each page.
                </p>
              </div>
              <Button 
                onClick={() => {
                  setActiveTab("page");
                  setTimeout(() => {
                    handleScanClick();
                    toast.info("Scanning current page. Site-wide scanning will be available in a future update.");
                  }, 100);
                }}
                className="mt-4"
              >
                Start with Current Page
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LinkChecker;
