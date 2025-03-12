
import React, { useState } from 'react';
import AdminHeader from "../AdminHeader";
import LinkChecker from '@/components/tools/LinkChecker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const LinkCheckerPage: React.FC = () => {
  const [customUrl, setCustomUrl] = useState('');
  const [urlToCheck, setUrlToCheck] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customUrl) {
      toast.error("Please enter a URL to check");
      return;
    }
    
    // Ensure URL has correct format
    let formattedUrl = customUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `${window.location.origin}${formattedUrl.startsWith('/') ? '' : '/'}${formattedUrl}`;
    }
    
    setUrlToCheck(formattedUrl);
    // Force iframe refresh
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Link Checker" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current Page</TabsTrigger>
              <TabsTrigger value="custom">Custom URL</TabsTrigger>
              <TabsTrigger value="sitewide">Site Scan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Check Current Page Links</CardTitle>
                  <CardDescription>
                    Scan this page for broken links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LinkChecker />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Check Links on a Specific Page</CardTitle>
                  <CardDescription>
                    Enter a URL to scan that page for broken links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUrlSubmit} className="mb-6 space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter URL or path (e.g., /admin or https://example.com)"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit">Check URL</Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Note: You can enter a full URL or just a path like /admin
                    </p>
                  </form>
                  
                  {urlToCheck && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium">Checking URL: {urlToCheck}</p>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden h-[500px]">
                        <iframe 
                          key={iframeKey}
                          src={`${urlToCheck}?linkChecker=true`} 
                          className="w-full h-full"
                          title="Link Checker"
                        />
                      </div>
                      
                      <div className="italic text-sm text-gray-500">
                        Note: The iframe above doesn't have Link Checker functionality. 
                        Add the LinkChecker component to the page you want to check.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sitewide" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Site-wide Link Check</CardTitle>
                  <CardDescription>
                    Comprehensive scan of the entire site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                    <p className="text-amber-700 mb-2 font-medium">Coming Soon: Full Site Scanner</p>
                    <p className="text-sm text-amber-600">
                      The comprehensive site-wide link checker is currently in development and will be available soon.
                      Until then, you can use the Current Page checker on individual pages.
                    </p>
                  </div>
                  
                  <div className="rounded-lg border border-dashed p-6 text-center bg-gray-50">
                    <h3 className="text-lg font-medium mb-2">Manual Site Scan</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      To check your entire site, start with the current page and then check these important pages:
                    </p>
                    <div className="space-y-2 text-left max-w-md mx-auto">
                      <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/', '_blank')}>
                        Homepage
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/admin/dashboard', '_blank')}>
                        Admin Dashboard
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/channel-types', '_blank')}>
                        Channel Types
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LinkCheckerPage;
