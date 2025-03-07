
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChannelFormData } from "@/types/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
}

const ChannelStatsFetcher = ({ channelUrl, onStatsReceived }: ChannelStatsFetcherProps) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [dataSource, setDataSource] = useState<"apify" | "youtube" | "mock">("apify");

  const fetchStats = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    // Reset states
    setLoading(true);
    setApiError(null);
    setIsMockData(false);
    setDataSource("apify");
    toast.info("Fetching channel stats via Apify...");

    try {
      // Normalize URL if it's a handle without full URL
      let formattedUrl = channelUrl;
      if (formattedUrl.startsWith('@') && !formattedUrl.includes('youtube.com')) {
        formattedUrl = `https://www.youtube.com/${formattedUrl}`;
      }
      
      // Clean up URL - remove trailing slashes, etc.
      formattedUrl = formattedUrl.trim();
      if (!formattedUrl.includes('http') && !formattedUrl.startsWith('@') && !formattedUrl.match(/^UC[\w-]{21,24}$/)) {
        // If it's not a URL, handle, or channel ID, it could be a search term
        if (formattedUrl.includes('youtube.com') || formattedUrl.includes('youtu.be')) {
          // It looks like a URL but without protocol
          formattedUrl = `https://${formattedUrl}`;
        }
      }
      
      console.log("Fetching stats for URL:", formattedUrl);
      
      // Call our Apify-powered function with improved error handling
      const { data, error } = await supabase.functions.invoke('fetch-channel-stats-apify', {
        body: { channelUrl: formattedUrl }
      });

      if (error) {
        console.error("Error fetching channel stats:", error);
        setApiError(`Failed to fetch stats: ${error.message}`);
        toast.error(`Failed to fetch stats: ${error.message}`);
        return;
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || "Failed to fetch channel stats";
        console.error(errorMessage);
        setApiError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      console.log("Stats received from Apify:", data);

      // Set data source and display appropriate notification
      setDataSource(data.source || "apify");
      
      if (data.is_mock) {
        setIsMockData(true);
        const reason = data.error_reason ? ` (${data.error_reason})` : '';
        toast.warning(`Using mock data - couldn't fetch actual channel stats${reason}`);
      } else {
        toast.success(`Channel stats fetched successfully via ${data.source || "Apify"}`);
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
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching stats";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={fetchStats}
        disabled={loading || !channelUrl}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Fetch Stats via Apify
      </Button>

      {apiError && (
        <Alert variant="destructive" className="mt-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="text-sm">{apiError}</AlertDescription>
        </Alert>
      )}

      {isMockData && !apiError && (
        <Alert className="mt-2 border-yellow-500">
          <AlertTitle className="text-yellow-600">Using Mock Data</AlertTitle>
          <AlertDescription className="text-sm">
            The provided stats are simulated approximations. The data scraping request failed.
          </AlertDescription>
        </Alert>
      )}

      {!isMockData && !apiError && dataSource === "apify" && (
        <Alert className="mt-2 border-blue-500">
          <AlertTitle className="text-blue-600">Using Apify Data</AlertTitle>
          <AlertDescription className="text-sm">
            Channel data was successfully scraped using Apify's YouTube scraper.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ChannelStatsFetcher;
