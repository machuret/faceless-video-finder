
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageOff, FileText, BarChart, Tag, Video, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Channel } from "@/types/youtube";

// Custom hooks
import { useChannelSelection } from "./hooks/useChannelSelection";
import { useTabManagement } from "./hooks/useTabManagement";

// Tab Content Components
import ScreenshotTabContent from "./components/ScreenshotTabContent";
import TypeTabContent from "./components/TypeTabContent";
import StatsTabContent from "./components/StatsTabContent";
import KeywordsTabContent from "./components/KeywordsTabContent";
import VideosTabContent from "./components/VideosTabContent";

const ChannelsToImprove = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Use our custom hooks for channel selection and tab management
  const { selectedChannel, handleChannelSelect } = useChannelSelection();
  const { activeTab, handleTabChange, fetchChannelsForTab } = useTabManagement(
    setChannels, setLoading, setError, handleChannelSelect
  );

  // Navigate to edit page
  const navigateToEdit = (channelId: string) => {
    navigate(`/admin/edit-channel/${channelId}`);
  };

  // Retry fetch for the current tab
  const retryFetch = () => {
    fetchChannelsForTab(activeTab as any);
  };

  // Initialize on mount
  useEffect(() => {
    retryFetch();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Channels To Improve</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={retryFetch} 
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
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
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Top Videos
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Content */}
        <TabsContent value="no-screenshot" className="mt-0">
          <ScreenshotTabContent
            channels={channels}
            loading={loading}
            error={error}
            selectedChannel={selectedChannel}
            onChannelSelect={handleChannelSelect}
            onRetry={retryFetch}
            onNavigateToEdit={navigateToEdit}
          />
        </TabsContent>
        
        <TabsContent value="no-type" className="mt-0">
          <TypeTabContent
            channels={channels}
            loading={loading}
            error={error}
            selectedChannel={selectedChannel}
            onChannelSelect={handleChannelSelect}
            onRetry={retryFetch}
            onNavigateToEdit={navigateToEdit}
          />
        </TabsContent>
        
        <TabsContent value="no-stats" className="mt-0">
          <StatsTabContent
            channels={channels}
            loading={loading}
            error={error}
            selectedChannel={selectedChannel}
            onChannelSelect={handleChannelSelect}
            onRetry={retryFetch}
            onNavigateToEdit={navigateToEdit}
          />
        </TabsContent>
        
        <TabsContent value="no-keywords" className="mt-0">
          <KeywordsTabContent
            channels={channels}
            loading={loading}
            error={error}
            selectedChannel={selectedChannel}
            onChannelSelect={handleChannelSelect}
            onRetry={retryFetch}
            onNavigateToEdit={navigateToEdit}
          />
        </TabsContent>
        
        <TabsContent value="videos" className="mt-0">
          <VideosTabContent
            channels={channels}
            loading={loading}
            error={error}
            selectedChannel={selectedChannel}
            onChannelSelect={handleChannelSelect}
            onRetry={retryFetch}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChannelsToImprove;
