import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageOff, FileText, BarChart, Tag, Video, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Channel } from "@/types/youtube";
import { useBulkScreenshotGenerator } from "@/components/youtube/channel-list/components/hooks/useBulkScreenshotGenerator";
import { useBulkStatsFetcher } from "@/components/youtube/channel-list/components/hooks/useBulkStatsFetcher";
import { useBulkTypeGenerator } from "@/components/youtube/channel-list/components/hooks/useBulkTypeGenerator";
import { useBulkKeywordsGenerator } from "@/components/youtube/channel-list/components/hooks/useBulkKeywordsGenerator";
import TopVideosPreview from "../channel-videos/TopVideosPreview";

const ChannelsToImprove = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState("no-screenshot");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize bulk operation hooks
  const screenshotGenerator = useBulkScreenshotGenerator();
  const statsFetcher = useBulkStatsFetcher();
  const typeGenerator = useBulkTypeGenerator();
  const keywordsGenerator = useBulkKeywordsGenerator();

  // Extract youtube channel ID if available in channel_url
  const extractYoutubeChannelId = (url: string) => {
    if (!url) return null;
    const channelMatch = url.match(/\/channel\/(UC[\w-]{22})/);
    if (channelMatch) return channelMatch[1];
    
    const rawIdMatch = url.match(/(UC[\w-]{22})/);
    if (rawIdMatch) return rawIdMatch[1];
    
    return null;
  };

  const fetchChannelsWithNoScreenshot = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try edge function approach
      try {
        const { data, error } = await supabase.functions.invoke('get-public-channels', {
          body: {
            missingScreenshot: true,
            limit: 20
          }
        });
        
        if (error) throw error;
        
        if (data && data.channels && Array.isArray(data.channels)) {
          // Transform the data to make it compatible with Channel type
          const typedChannels: Channel[] = data.channels.map(channel => ({
            ...channel,
            // Ensure metadata is properly typed
            metadata: channel.metadata || {}
          }));
          
          setChannels(typedChannels);
          if (typedChannels.length > 0) {
            setSelectedChannel(typedChannels[0]);
          } else {
            setSelectedChannel(null);
          }
          return;
        }
      } catch (edgeFunctionError) {
        console.warn("Edge function failed, falling back to direct query:", edgeFunctionError);
      }
      
      // Fall back to direct query
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .is('screenshot_url', null)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata || {}
      }));
      
      setChannels(typedChannels);
      if (typedChannels.length > 0) {
        setSelectedChannel(typedChannels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error fetching channels with no screenshot:", error);
      setError("Failed to fetch channels with no screenshot. Please try again later.");
      toast.error("Failed to fetch channels with no screenshot");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelsWithNoType = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try edge function approach
      try {
        const { data, error } = await supabase.functions.invoke('get-public-channels', {
          body: {
            missingType: true,
            limit: 20
          }
        });
        
        if (error) throw error;
        
        if (data && data.channels && Array.isArray(data.channels)) {
          // Transform the data to make it compatible with Channel type
          const typedChannels: Channel[] = data.channels.map(channel => ({
            ...channel,
            // Ensure metadata is properly typed
            metadata: channel.metadata || {}
          }));
          
          setChannels(typedChannels);
          if (typedChannels.length > 0) {
            setSelectedChannel(typedChannels[0]);
          } else {
            setSelectedChannel(null);
          }
          return;
        }
      } catch (edgeFunctionError) {
        console.warn("Edge function failed, falling back to direct query:", edgeFunctionError);
      }
      
      // Fall back to direct query
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .or('channel_type.is.null,channel_type.eq.other')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata || {}
      }));
      
      setChannels(typedChannels);
      if (typedChannels.length > 0) {
        setSelectedChannel(typedChannels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error fetching channels with no type:", error);
      setError("Failed to fetch channels with no type. Please try again later.");
      toast.error("Failed to fetch channels with no type");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelsWithNoStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try edge function approach
      try {
        const { data, error } = await supabase.functions.invoke('get-public-channels', {
          body: {
            missingStats: true,
            limit: 20
          }
        });
        
        if (error) throw error;
        
        if (data && data.channels && Array.isArray(data.channels)) {
          // Transform the data to make it compatible with Channel type
          const typedChannels: Channel[] = data.channels.map(channel => ({
            ...channel,
            // Ensure metadata is properly typed
            metadata: channel.metadata || {}
          }));
          
          setChannels(typedChannels);
          if (typedChannels.length > 0) {
            setSelectedChannel(typedChannels[0]);
          } else {
            setSelectedChannel(null);
          }
          return;
        }
      } catch (edgeFunctionError) {
        console.warn("Edge function failed, falling back to direct query:", edgeFunctionError);
      }
      
      // Fall back to direct query
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .or('total_subscribers.is.null,total_views.is.null,video_count.is.null')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata || {}
      }));
      
      setChannels(typedChannels);
      if (typedChannels.length > 0) {
        setSelectedChannel(typedChannels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error fetching channels with no stats:", error);
      setError("Failed to fetch channels with no stats. Please try again later.");
      toast.error("Failed to fetch channels with no stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelsWithNoKeywords = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try edge function approach
      try {
        const { data, error } = await supabase.functions.invoke('get-public-channels', {
          body: {
            missingKeywords: true,
            limit: 20
          }
        });
        
        if (error) throw error;
        
        if (data && data.channels && Array.isArray(data.channels)) {
          // Transform the data to make it compatible with Channel type
          const typedChannels: Channel[] = data.channels.map(channel => ({
            ...channel,
            // Ensure metadata is properly typed
            metadata: channel.metadata || {}
          }));
          
          setChannels(typedChannels);
          if (typedChannels.length > 0) {
            setSelectedChannel(typedChannels[0]);
          } else {
            setSelectedChannel(null);
          }
          return;
        }
      } catch (edgeFunctionError) {
        console.warn("Edge function failed, falling back to direct query:", edgeFunctionError);
      }
      
      // Fall back to direct query
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .or('keywords.is.null,keywords.eq.{}')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata || {}
      }));
      
      setChannels(typedChannels);
      if (typedChannels.length > 0) {
        setSelectedChannel(typedChannels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error fetching channels with no keywords:", error);
      setError("Failed to fetch channels with no keywords. Please try again later.");
      toast.error("Failed to fetch channels with no keywords");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelsWithNoVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try edge function approach
      try {
        const { data, error } = await supabase.functions.invoke('get-public-channels', {
          body: {
            hasStats: true, // Only get channels with video count
            limit: 20
          }
        });
        
        if (error) throw error;
        
        if (data && data.channels && Array.isArray(data.channels)) {
          // Transform the data to make it compatible with Channel type
          const typedChannels: Channel[] = data.channels.map(channel => ({
            ...channel,
            // Ensure metadata is properly typed
            metadata: channel.metadata || {}
          }));
          
          setChannels(typedChannels);
          if (typedChannels.length > 0) {
            setSelectedChannel(typedChannels[0]);
          } else {
            setSelectedChannel(null);
          }
          return;
        }
      } catch (edgeFunctionError) {
        console.warn("Edge function failed, falling back to direct query:", edgeFunctionError);
      }
      
      // Fall back to direct query
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .not('video_count', 'is', null) // Ensure we only get channels with video count
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Transform the data to make it compatible with Channel type
      const typedChannels: Channel[] = (data || []).map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata || {}
      }));
      
      setChannels(typedChannels);
      if (typedChannels.length > 0) {
        setSelectedChannel(typedChannels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error fetching channels for video fetching:", error);
      setError("Failed to fetch channels for video fetching. Please try again later.");
      toast.error("Failed to fetch channels for video fetching");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedChannel(null);
    setError(null);
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
      case "videos":
        fetchChannelsWithNoVideos();
        break;
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  useEffect(() => {
    fetchChannelsWithNoScreenshot();
  }, []);

  const navigateToEdit = (channelId: string) => {
    navigate(`/admin/edit-channel/${channelId}`);
  };

  const retryFetch = () => {
    switch (activeTab) {
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
      case "videos":
        fetchChannelsWithNoVideos();
        break;
    }
  };

  const generateScreenshot = (channel: Channel) => {
    const selectedChannel = {
      id: channel.id,
      url: channel.channel_url,
      title: channel.channel_title
    };
    
    screenshotGenerator.generateScreenshotsForChannels([selectedChannel])
      .then(() => {
        fetchChannelsWithNoScreenshot();
      });
  };

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
            </div>
          ))}
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
        </TabsContent>
        
        <TabsContent value="videos" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium mb-3">Select Channel</h3>
              <div className="max-h-96 overflow-auto space-y-2 pr-2">
                {loading ? (
                  <div className="text-gray-500 py-4">Loading channels...</div>
                ) : error ? (
                  <div className="text-red-500 py-4">
                    <p>{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={retryFetch} 
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : channels.length === 0 ? (
                  <div className="text-gray-500 py-4">No channels found in this category.</div>
                ) : (
                  channels.map(channel => (
                    <div 
                      key={channel.id} 
                      className={`p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${selectedChannel?.id === channel.id ? 'border-blue-500 bg-blue-50' : ''}`}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      <p className="font-medium truncate">{channel.channel_title}</p>
                      <p className="text-sm text-gray-500 truncate">{channel.channel_url}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div>
              {selectedChannel && (
                <TopVideosPreview 
                  channelId={selectedChannel.id}
                  youtubeChannelId={selectedChannel.channel_url ? extractYoutubeChannelId(selectedChannel.channel_url) || undefined : undefined}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );

  function renderChannelList(renderActions: (channel: Channel) => React.ReactNode) {
    if (loading) {
      return <div className="text-gray-500 py-4">Loading channels...</div>;
    }

    if (error) {
      return (
        <div className="text-red-500 py-4">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={retryFetch} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (channels.length === 0) {
      return <div className="text-gray-500 py-4">No channels found in this category.</div>;
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
