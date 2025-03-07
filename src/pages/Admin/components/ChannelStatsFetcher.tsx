
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "@/types/forms";

interface ChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
}

const ChannelStatsFetcher = ({ channelUrl, onStatsReceived }: ChannelStatsFetcherProps) => {
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    setLoading(true);
    toast.info("Fetching channel stats...");

    try {
      // Check if the URL has standard YouTube patterns
      const isValidYouTubeUrl = 
        channelUrl.includes('youtube.com/') || 
        channelUrl.includes('youtu.be/') || 
        channelUrl.includes('@') ||
        /^UC[\w-]{21,24}$/.test(channelUrl);

      if (!isValidYouTubeUrl) {
        toast.warning("URL may not be a valid YouTube channel URL");
      }

      // Ensure URL is properly formatted for the API
      let formattedUrl = channelUrl;
      if (formattedUrl.startsWith('@') && !formattedUrl.includes('youtube.com')) {
        formattedUrl = `https://www.youtube.com/${formattedUrl}`;
      }
      
      console.log("Fetching stats for URL:", formattedUrl);
      
      const { data, error } = await supabase.functions.invoke('fetch-channel-stats', {
        body: { channelUrl: formattedUrl }
      });

      if (error) {
        console.error("Error fetching channel stats:", error);
        throw new Error(`Failed to fetch stats: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to fetch channel stats");
      }

      console.log("Stats received:", data);

      // Warn if using mock data
      if (data.is_mock) {
        toast.warning("Using mock data - couldn't fetch actual channel stats");
      } else {
        toast.success("Channel stats fetched successfully");
      }

      // Make sure we include all fields including country
      const stats: Partial<ChannelFormData> = {
        total_subscribers: data.subscriberCount?.toString() || "",
        total_views: data.viewCount?.toString() || "",
        video_count: data.videoCount?.toString() || "",
        description: data.description || "",
        channel_title: data.title || "",
        start_date: data.startDate || "",
        country: data.country || ""
      };

      console.log("Processed stats with all fields:", stats);
      onStatsReceived(stats);
    } catch (err) {
      console.error("Error in fetch stats flow:", err);
      toast.error(err instanceof Error ? err.message : "Unknown error fetching stats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={fetchStats}
      disabled={loading || !channelUrl}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Fetch Stats
    </Button>
  );
};

export default ChannelStatsFetcher;
