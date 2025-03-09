
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import TopVideosPreview from "../channel-videos/TopVideosPreview";

interface Channel {
  id: string;
  channel_title: string;
  channel_url: string;
  total_subscribers?: number;
  total_views?: number;
}

const ChannelVideosSection = () => {
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);

  // Extract youtube channel ID if available in channel_url
  const extractYoutubeChannelId = (url: string) => {
    if (!url) return null;
    const channelMatch = url.match(/\/channel\/(UC[\w-]{22})/);
    if (channelMatch) return channelMatch[1];
    
    const rawIdMatch = url.match(/(UC[\w-]{22})/);
    if (rawIdMatch) return rawIdMatch[1];
    
    return null;
  };

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_title, channel_url, total_subscribers, total_views")
          .order("total_views", { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        // Filter to only include channels with valid YouTube channel IDs
        const filteredChannels = data.filter(channel => 
          extractYoutubeChannelId(channel.channel_url) !== null
        );
        
        setChannels(filteredChannels);
        if (filteredChannels.length > 0) {
          setSelectedChannel(filteredChannels[0]);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Top Videos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No channels found with valid YouTube IDs
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="channel-select" className="block text-sm font-medium mb-2">
                Select Channel
              </label>
              <select
                id="channel-select"
                className="w-full p-2 border rounded"
                value={selectedChannel?.id || ""}
                onChange={(e) => {
                  const channel = channels.find(c => c.id === e.target.value);
                  setSelectedChannel(channel || null);
                }}
              >
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.channel_title} ({channel.total_subscribers ? new Intl.NumberFormat().format(channel.total_subscribers) : 'N/A'} subscribers)
                  </option>
                ))}
              </select>
            </div>
            
            {selectedChannel && (
              <TopVideosPreview 
                channelId={selectedChannel.id}
                youtubeChannelId={selectedChannel.channel_url ? extractYoutubeChannelId(selectedChannel.channel_url) || undefined : undefined}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelVideosSection;
