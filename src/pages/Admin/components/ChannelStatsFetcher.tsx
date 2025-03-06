
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "@/types/forms";

interface ChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
}

const ChannelStatsFetcher = ({ channelUrl, onStatsReceived }: ChannelStatsFetcherProps) => {
  const [loading, setLoading] = useState(false);

  const fetchLatestStats = async () => {
    if (!channelUrl) {
      toast.error("Channel URL is required to fetch stats");
      return;
    }

    try {
      setLoading(true);
      toast.info("Fetching latest channel statistics...");
      
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🔄 Requesting channel stats for: ${channelUrl}`);
      
      // Extract channel ID if it's in a URL format
      let channelId = channelUrl;
      
      // Handle URLs with /channel/ format
      if (channelUrl.includes('/channel/')) {
        const match = channelUrl.match(/\/channel\/([^\/\?]+)/);
        if (match && match[1]) {
          channelId = match[1];
        }
      }
      
      // Call the stats-only endpoint
      const { data, error } = await supabase.functions.invoke('fetch-channel-stats', {
        body: {
          channelId,
          url: channelUrl,
          timestamp
        }
      });
      
      if (error) {
        console.error(`[${timestamp}] ❌ Error fetching stats:`, error);
        toast.error(`Failed to fetch statistics: ${error.message}`);
        return;
      }
      
      if (!data || data.error) {
        console.error(`[${timestamp}] ❌ API error:`, data?.error || "No data received");
        toast.error(`Error: ${data?.error || "Failed to retrieve statistics"}`);
        return;
      }
      
      console.log(`[${timestamp}] ✅ Statistics received:`, data);
      toast.success("Channel statistics fetched successfully!");
      
      // Format the received stats to match our form data structure
      const formattedStats: Partial<ChannelFormData> = {
        total_subscribers: data.subscriberCount ? String(data.subscriberCount) : undefined,
        total_views: data.viewCount ? String(data.viewCount) : undefined,
        video_count: data.videoCount ? String(data.videoCount) : undefined
      };
      
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
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? "Fetching..." : "Refresh Channel Stats"}
    </Button>
  );
};

export default ChannelStatsFetcher;
