
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
  const [dataSource, setDataSource] = useState<"apify" | "youtube" | null>(null);
  const [partialData, setPartialData] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [consecutiveAttempts, setConsecutiveAttempts] = useState(0);

  const verifyRequiredFields = (data: any): string[] => {
    const requiredFields = [
      { key: 'subscriberCount', label: 'Total Subscribers' },
      { key: 'viewCount', label: 'Total Views' },
      { key: 'videoCount', label: 'Video Count' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'description', label: 'Description' },
      { key: 'country', label: 'Country' }
    ];
    
    const missing = requiredFields.filter(field => {
      return !data[field.key] || data[field.key] === "0";
    });
    
    return missing.map(field => field.label);
  };

  const fetchStats = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    // Reset states
    setLoading(true);
    setApiError(null);
    setDataSource(null);
    setPartialData(false);
    setMissingFields([]);
    
    // Increment consecutive attempts
    setConsecutiveAttempts(prev => prev + 1);
    
    // If too many consecutive attempts with failures
    if (consecutiveAttempts >= 2) {
      toast.warning("Multiple fetch attempts detected. Please try filling in data manually if fetching continues to fail.");
    } else {
      toast.info("Fetching channel stats via Apify...");
    }

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

      // Verify all required fields are present
      const missing = verifyRequiredFields(data);
      setMissingFields(missing);
      const hasPartialData = missing.length > 0;
      setPartialData(hasPartialData);
      
      if (hasPartialData) {
        console.warn("Partial data received. Missing fields:", missing);
        toast.warning(`Some channel data is missing: ${missing.join(', ')}`);
        
        // Reset consecutive attempts if we got any data
        if (Object.keys(data).length > 2) { // success + source = 2 keys
          setConsecutiveAttempts(0);
        }
      } else {
        toast.success(`Channel stats fetched successfully via ${data.source || "Apify"}`);
        setConsecutiveAttempts(0); // Reset consecutive attempts on success
      }

      // Set data source
      setDataSource(data.source || "apify");

      // Make sure we include all fields including country and description
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setApiError(errorMessage);
      toast.error(`Failed to fetch stats: ${errorMessage}`);
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

      {!apiError && partialData && (
        <Alert className="mt-2 border-yellow-500 bg-yellow-50">
          <AlertTitle className="text-yellow-600">Incomplete Data</AlertTitle>
          <AlertDescription className="text-sm">
            Missing fields: {missingFields.join(', ')}. You'll need to fill these in manually.
          </AlertDescription>
        </Alert>
      )}

      {!apiError && dataSource === "apify" && !partialData && (
        <Alert className="mt-2 border-green-500 bg-green-50">
          <AlertTitle className="text-green-600">Complete Data Retrieved</AlertTitle>
          <AlertDescription className="text-sm">
            All channel data was successfully scraped using Apify's YouTube scraper.
          </AlertDescription>
        </Alert>
      )}
      
      {consecutiveAttempts >= 2 && (
        <Alert className="mt-2 border-blue-500 bg-blue-50">
          <AlertTitle className="text-blue-600">Multiple Fetch Attempts</AlertTitle>
          <AlertDescription className="text-sm">
            Consider entering the missing data manually if automated fetching continues to fail.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ChannelStatsFetcher;
