
import React, { useState, useEffect } from 'react';
import { useLinkChecker } from '@/hooks/useLinkChecker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import PageScanner from './components/PageScanner';
import SiteScanner from './components/SiteScanner';

interface LinkCheckerProps {
  autoScan?: boolean;
}

const LinkChecker: React.FC<LinkCheckerProps> = ({ autoScan = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("page");
  const linkChecker = useLinkChecker();

  useEffect(() => {
    if (autoScan) {
      linkChecker.scanPageLinks();
      setIsExpanded(true);
    }
  }, [autoScan, linkChecker]);

  const handleScanClick = () => {
    setIsExpanded(true);
    linkChecker.scanPageLinks();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "site" && !linkChecker.isChecking) {
      toast.info("Site-wide link checking will be available soon. For now, check individual pages.");
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
          {(!linkChecker.isChecking && linkChecker.brokenLinks.length === 0 && !isExpanded) ? (
            <CardFooter className="pt-2">
              <Button 
                onClick={handleScanClick} 
                disabled={linkChecker.isChecking}
                className="w-full"
              >
                Scan for Broken Links
              </Button>
            </CardFooter>
          ) : (
            <PageScanner 
              linkChecker={linkChecker} 
              onReset={() => {
                linkChecker.reset();
                setIsExpanded(false);
              }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="site">
          <SiteScanner 
            onStartPageScan={() => {
              setActiveTab("page");
              setTimeout(() => {
                handleScanClick();
              }, 100);
            }}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LinkChecker;
