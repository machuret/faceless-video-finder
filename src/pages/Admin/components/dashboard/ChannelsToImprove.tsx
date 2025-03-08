import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageOff, FileText, BarChart, Tag, AlertCircle, RefreshCw, Info, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Channel } from "@/types/youtube";
import { useBulkScreenshotGenerator } from "@/components/youtube/channel-list/components/hooks/useBulkScreenshotGenerator";
import { useBulkStatsFetcher } from "@/components/youtube/channel-list/components/hooks/useBulkStatsFetcher";
import { useBulkTypeGenerator } from "@/components/youtube/channel-list/components/hooks/useBulkTypeGenerator";
import { useBulkKeywordsGenerator } from "@/components/youtube/channel-list/components/hooks/useBulkKeywordsGenerator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ChannelsToImprove = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState("no-screenshot");
  
  // Initialize bulk operation hooks
  const screenshotGenerator = useBulkScreenshotGenerator();
  const statsFetcher = useBulkStatsFetcher();
  const typeGenerator = useBulkTypeGenerator();
  const keywordsGenerator = useBulkKeywordsGenerator();

  // Function to fetch channels with no screenshot
  const fetchChannelsWithNoScreenshot = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .is('screenshot_url', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata as Channel['metadata']
      }));
      
      setChannels(typedChannels);
    } catch (error) {
      console.error("Error fetching channels with no screenshot:", error);
      toast.error("Failed to fetch channels with no screenshot");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch channels with no type
  const fetchChannelsWithNoType = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .or('channel_type.is.null,channel_type.eq.other')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata as Channel['metadata']
      }));
      
      setChannels(typedChannels);
    } catch (error) {
      console.error("Error fetching channels with no type:", error);
      toast.error("Failed to fetch channels with no type");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch channels with no stats
  const fetchChannelsWithNoStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .or('total_subscribers.is.null,total_views.is.null,video_count.is.null,start_date.is.null,cpm.is.null')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata as Channel['metadata']
      }));
      
      setChannels(typedChannels);
    } catch (error) {
      console.error("Error fetching channels with no stats:", error);
      toast.error("Failed to fetch channels with no stats");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch channels with no keywords
  const fetchChannelsWithNoKeywords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .or('keywords.is.null,keywords.eq.{}')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata as Channel['metadata']
      }));
      
      setChannels(typedChannels);
    } catch (error) {
      console.error("Error fetching channels with no keywords:", error);
      toast.error("Failed to fetch channels with no keywords");
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change and load appropriate data
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case "no-screenshot":
        fetchChannelsWithNoScreenshot();
        break;
      case "no-type":
        fetchChannelsWithNoType();
        break;
      case "no-stats":
        fetchChannelsWithNoStats();
        break;
      case "no-keywords":
        fetchChannelsWithNoKeywords();
        break;
    }
  };

  // Load screenshot data on initial render
  React.useEffect(() => {
    fetchChannelsWithNoScreenshot();
  }, []);

  // Navigate to edit page for a channel
  const navigateToEdit = (channelId: string) => {
    navigate(`/admin/edit-channel/${channelId}`);
  };

  // Open channel in new tab
  const openChannelInNewTab = (channelUrl: string) => {
    window.open(channelUrl, '_blank');
  };

  // Screenshot generation handler
  const generateScreenshot = (channel: Channel) => {
    const selectedChannel = {
      id: channel.id,
      url: channel.channel_url,
      title: channel.channel_title
    };
    
    // Show more informative toast
    toast.info(
      "Starting screenshot capture. This process may take up to 2 minutes. " +
      "The screenshot is taken by connecting to YouTube and waiting for the page to load fully."
    );
    
    screenshotGenerator.generateScreenshotsForChannels([selectedChannel])
      .then(() => {
        fetchChannelsWithNoScreenshot();
      });
  };

  // Stats generation handler
  const generateStats = (channel: Channel) => {
    const selectedChannel = {
      id: channel.id,
      url: channel.channel_url,
      title: channel.channel_title
    };
    
    statsFetcher.fetchStatsForChannels([selectedChannel])
      .then(() => {
        fetchChannelsWithNoStats();
      });
  };

  // Type generation handler
  const generateType = (channel: Channel) => {
    const selectedChannel = {
      id: channel.id,
      url: channel.channel_url,
      title: channel.channel_title
    };
    
    typeGenerator.generateTypesForChannels([selectedChannel])
      .then(() => {
        fetchChannelsWithNoType();
      });
  };

  // Keywords generation handler
  const generateKeywords = (channel: Channel) => {
    const selectedChannel = {
      id: channel.id,
      url: channel.channel_url,
      title: channel.channel_title
    };
    
    keywordsGenerator.generateKeywordsForChannels([selectedChannel])
      .then(() => {
        fetchChannelsWithNoKeywords();
      });
  };

  // Refresh current tab data
  const refreshCurrentTab = () => {
    handleTabChange(activeTab);
  };

  // Handler to retry failed channels
  const retryFailed = () => {
    switch (activeTab) {
      case "no-screenshot":
        if (screenshotGenerator.failedChannels.length > 0) {
          screenshotGenerator.retryFailedChannels().then(refreshCurrentTab);
        } else {
          toast.info("No failed channels to retry");
        }
        break;
      case "no-type":
        if (typeGenerator.failedChannels.length > 0) {
          typeGenerator.retryFailedChannels().then(refreshCurrentTab);
        } else {
          toast.info("No failed channels to retry");
        }
        break;
      case "no-stats":
        if (statsFetcher.failedChannels.length > 0) {
          statsFetcher.retryFailedChannels().then(refreshCurrentTab);
        } else {
          toast.info("No failed channels to retry");
        }
        break;
      case "no-keywords":
        if (keywordsGenerator.failedChannels.length > 0) {
          keywordsGenerator.retryFailedChannels().then(refreshCurrentTab);
        } else {
          toast.info("No failed channels to retry");
        }
        break;
    }
  };

  // Get failed channels from the active tab
  const getFailedChannelsForActiveTab = () => {
    switch (activeTab) {
      case "no-screenshot":
        return screenshotGenerator.failedChannels;
      case "no-type":
        return typeGenerator.failedChannels;
      case "no-stats":
        return statsFetcher.failedChannels;
      case "no-keywords":
        return keywordsGenerator.failedChannels;
      default:
        return [];
    }
  };

  // Get if any operation is processing based on the active tab
  const isProcessingOnActiveTab = () => {
    switch (activeTab) {
      case "no-screenshot":
        return screenshotGenerator.isProcessing;
      case "no-type":
        return typeGenerator.isProcessing;
      case "no-stats":
        return statsFetcher.isProcessing;
      case "no-keywords":
        return keywordsGenerator.isProcessing;
      default:
        return false;
    }
  };

  // Show error report if we have failures
  const renderErrorReport = () => {
    const failedChannels = getFailedChannelsForActiveTab();

    if (failedChannels.length === 0) return null;

    return (
      <div className="mt-4 p-4 border rounded-md bg-red-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Failed operations ({failedChannels.length})</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-700 hover:text-red-800 hover:bg-red-100"
            onClick={retryFailed}
            disabled={isProcessingOnActiveTab()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Failed
          </Button>
        </div>
        
        <ScrollArea className="h-[200px] w-full">
          <Accordion type="multiple" className="w-full">
            {failedChannels.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-sm">
                  <span className="truncate max-w-[400px]">{item.channel.title}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2 text-sm bg-white rounded border mb-2">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500 mb-1">Channel URL:</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 ml-2"
                        onClick={() => openChannelInNewTab(item.channel.url)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="truncate">{item.channel.url}</p>
                  </div>
                  <div className="p-2 text-sm bg-white rounded border">
                    <p className="text-gray-500 mb-1">Error:</p>
                    <p className="text-red-600">{item.error}</p>
                  </div>
                  {activeTab === "no-screenshot" && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-medium mb-1">Possible solutions:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Try using a different URL format (e.g., @handle instead of /channel/ID)</li>
                        <li>Check if the channel is public and accessible</li>
                        <li>Try again later when YouTube or Apify servers are less busy</li>
                      </ul>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </div>
    );
  };

  // Render empty state with appropriate message based on tab
  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      switch (activeTab) {
        case "no-screenshot":
          return "All channels have screenshots. Great job!";
        case "no-type":
          return "All channels have types assigned. Great job!";
        case "no-stats":
          return "All channels have complete statistics. Great job!";
        case "no-keywords":
          return "All channels have keywords assigned. Great job!";
        default:
          return "No channels found in this category.";
      }
    };

    return (
      <Alert className="bg-green-50 border-green-200">
        <Info className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800">All Set!</AlertTitle>
        <AlertDescription className="text-green-700">
          {getEmptyMessage()}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Channels To Improve</h2>
      
      <Tabs defaultValue="no-screenshot" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="no-screenshot" className="flex items-center gap-2">
            <ImageOff className="h-4 w-4" />
            No Screenshot
          </TabsTrigger>
          <TabsTrigger value="no-type" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            No Type
          </TabsTrigger>
          <TabsTrigger value="no-stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            No Stats
          </TabsTrigger>
          <TabsTrigger value="no-keywords" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            No Keywords
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="no-screenshot" className="mt-0">
          {renderChannelList((channel) => (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => generateScreenshot(channel)}
                disabled={screenshotGenerator.isProcessing}
              >
                {screenshotGenerator.currentChannel === channel.channel_title ? 'Processing...' : 'Generate Screenshot'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateToEdit(channel.id)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openChannelInNewTab(channel.channel_url)}
                title="Open channel in YouTube"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {renderErrorReport()}
        </TabsContent>
        
        <TabsContent value="no-type" className="mt-0">
          {renderChannelList((channel) => (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => generateType(channel)}
                disabled={typeGenerator.isProcessing}
              >
                {typeGenerator.currentChannel === channel.channel_title ? 'Processing...' : 'Generate Type'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateToEdit(channel.id)}
              >
                Edit
              </Button>
            </div>
          ))}
          {renderErrorReport()}
        </TabsContent>
        
        <TabsContent value="no-stats" className="mt-0">
          {renderChannelList((channel) => (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => generateStats(channel)}
                disabled={statsFetcher.isProcessing}
              >
                {statsFetcher.currentChannel === channel.channel_title ? 'Processing...' : 'Fetch Stats'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateToEdit(channel.id)}
              >
                Edit
              </Button>
            </div>
          ))}
          {renderErrorReport()}
        </TabsContent>
        
        <TabsContent value="no-keywords" className="mt-0">
          {renderChannelList((channel) => (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => generateKeywords(channel)}
                disabled={keywordsGenerator.isProcessing}
              >
                {keywordsGenerator.currentChannel === channel.channel_title ? 'Processing...' : 'Generate Keywords'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateToEdit(channel.id)}
              >
                Edit
              </Button>
            </div>
          ))}
          {renderErrorReport()}
        </TabsContent>
      </Tabs>
    </Card>
  );

  function renderChannelList(renderActions: (channel: Channel) => React.ReactNode) {
    if (loading) {
      return <div className="text-gray-500 py-4">Loading channels...</div>;
    }

    if (channels.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-2 max-h-96 overflow-auto">
        {channels.map(channel => (
          <div 
            key={channel.id} 
            className="p-4 border rounded-md flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <div className="truncate max-w-[70%]">
              <p className="font-medium truncate">{channel.channel_title}</p>
              <p className="text-sm text-gray-500 truncate">{channel.channel_url}</p>
            </div>
            {renderActions(channel)}
          </div>
        ))}
      </div>
    );
  }
};

export default ChannelsToImprove;
