
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "@/types/forms";

interface ChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
  onDescriptionReceived?: (description: string) => void;
  fetchDescriptionOnly?: boolean;
}

const ChannelStatsFetcher = ({ 
  channelUrl, 
  onStatsReceived, 
  onDescriptionReceived,
  fetchDescriptionOnly = false 
}: ChannelStatsFetcherProps) => {
  const [loading, setLoading] = useState(false);

  const fetchLatestStats = async () => {
    if (!channelUrl) {
      toast.error("Channel URL or name is required to fetch stats");
      return;
    }

    try {
      setLoading(true);
      toast.info(fetchDescriptionOnly 
        ? "Fetching channel description..." 
        : "Fetching latest channel information..."
      );
      
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🔄 Requesting ${fetchDescriptionOnly ? 'description' : 'data'} for: ${channelUrl}`);
      
      // Extract channel ID if it's in a URL format
      let channelId = channelUrl;
      
      // Handle URLs with /channel/ format
      if (channelUrl.includes('/channel/')) {
        const match = channelUrl.match(/\/channel\/([^\/\?]+)/);
        if (match && match[1]) {
          channelId = match[1];
        }
      }
      
      // For non-URL non-ID inputs, treat as channel name/title
      const isUrl = channelUrl.includes('youtube.com') || channelUrl.includes('youtu.be');
      const isChannelId = /^UC[\w-]{21,24}$/.test(channelUrl);
      
      // Call the stats endpoint
      const { data, error } = await supabase.functions.invoke('fetch-channel-stats', {
        body: {
          channelId: isChannelId ? channelUrl : undefined,
          url: channelUrl.trim(),
          includeDescription: true,
          fetchDescriptionOnly: fetchDescriptionOnly,
          timestamp
        }
      });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Error fetching stats:`, error);
        toast.error(`Failed to fetch information: ${error.message}`);
        return;
      }
      
      if (!data) {
        console.error(`[${timestamp}] ❌ No data received`);
        toast.error("No data received from the API");
        return;
      }
      
      if (data.error) {
        console.error(`[${timestamp}] ❌ API error:`, data.error);
        toast.error(`Error: ${data.error}`);
        return;
      }
      
      console.log(`[${timestamp}] ✅ Channel information received:`, data);
      
      // If this is a description-only fetch
      if (fetchDescriptionOnly) {
        if (data.channelInfo && data.channelInfo.description) {
          console.log(`[${timestamp}] ✅ Channel description fetched:`, data.channelInfo.description.substring(0, 100) + '...');
          if (onDescriptionReceived) {
            onDescriptionReceived(data.channelInfo.description);
          }
          toast.success("Channel description fetched successfully!");
        } else {
          toast.error("No description found for this channel");
        }
        return;
      }
      
      // Format the received stats to match our form data structure
      const formattedStats: Partial<ChannelFormData> = {
        total_subscribers: data.subscriberCount ? String(data.subscriberCount) : undefined,
        total_views: data.viewCount ? String(data.viewCount) : undefined,
        video_count: data.videoCount ? String(data.videoCount) : undefined
      };
      
      // If we have channel info and no channel title in the form, set it
      if (data.channelInfo && data.channelInfo.title) {
        formattedStats.channel_title = data.channelInfo.title;
      }

      // If we have a description, set it
      if (data.channelInfo && data.channelInfo.description) {
        formattedStats.description = data.channelInfo.description;
        toast.success("Channel description fetched successfully!");
      }
      
      toast.success("Channel information fetched successfully!");
      
      // Pass the stats up to the parent component
      onStatsReceived(formattedStats);
      
    } catch (err) {
      console.error("Unexpected error fetching stats:", err);
      toast.error(`Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      size="sm" 
      onClick={fetchLatestStats} 
      disabled={loading || !channelUrl}
      className="flex items-center gap-1"
    >
      {fetchDescriptionOnly ? (
        <FileText className="h-4 w-4" />
      ) : (
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      )}
      {loading 
        ? "Fetching..." 
        : fetchDescriptionOnly 
          ? "Fetch Description Only" 
          : "Refresh Channel Info"
      }
    </Button>
  );
};

export default ChannelStatsFetcher;
