
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageOff, FileText, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Channel } from "@/types/youtube";

const ChannelsToImprove = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState("no-screenshot");

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

  const fetchChannelsWithNoStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .or('total_subscribers.is.null,total_views.is.null,video_count.is.null')
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
    }
  };

  React.useEffect(() => {
    fetchChannelsWithNoScreenshot();
  }, []);

  const navigateToEdit = (channelId: string) => {
    navigate(`/admin/edit-channel/${channelId}`);
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
        </TabsList>
        
        <TabsContent value="no-screenshot" className="mt-0">
          {renderChannelList()}
        </TabsContent>
        
        <TabsContent value="no-type" className="mt-0">
          {renderChannelList()}
        </TabsContent>
        
        <TabsContent value="no-stats" className="mt-0">
          {renderChannelList()}
        </TabsContent>
      </Tabs>
    </Card>
  );

  function renderChannelList() {
    if (loading) {
      return <div className="text-gray-500 py-4">Loading channels...</div>;
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
            <div className="truncate max-w-[80%]">
              <p className="font-medium truncate">{channel.channel_title}</p>
              <p className="text-sm text-gray-500 truncate">{channel.channel_url}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateToEdit(channel.id)}
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
    );
  }
};

export default ChannelsToImprove;
