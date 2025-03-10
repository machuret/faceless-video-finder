
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
                    Comprehensive scan of the entire site (Coming Soon)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-12 text-center">
                    <p className="text-gray-500 mb-4">This feature is coming soon.</p>
                    <p className="text-sm">
                      The site-wide link checker will crawl all pages of the site and generate a comprehensive report.
                    </p>
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
