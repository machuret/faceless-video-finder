
import { useState } from "react";
import { ChannelFormData } from "@/types/forms";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelStatsResponse } from "supabase/functions/fetch-channel-stats-apify/types";

export interface UseChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
}

export function useChannelStatsFetcher({ channelUrl, onStatsReceived }: UseChannelStatsFetcherProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingMissing, setFetchingMissing] = useState(false);
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
      const { data, error } = await supabase.functions.invoke<ChannelStatsResponse>('fetch-channel-stats-apify', {
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

  // Modified function to fetch any missing fields, not just description and country
  const fetchMissingFields = async () => {
    if (!channelUrl) {
      toast.error("Please enter a channel URL or title first");
      return;
    }

    setFetchingMissing(true);
    setApiError(null);
    
    toast.info(`Attempting to fetch missing fields: ${missingFields.join(', ')}...`);

    try {
      // Normalize URL if it's a handle without full URL
      let formattedUrl = channelUrl;
      if (formattedUrl.startsWith('@') && !formattedUrl.includes('youtube.com')) {
        formattedUrl = `https://www.youtube.com/${formattedUrl}`;
      }
      
      // Clean up URL
      formattedUrl = formattedUrl.trim();
      if (!formattedUrl.includes('http') && !formattedUrl.startsWith('@') && !formattedUrl.match(/^UC[\w-]{21,24}$/)) {
        if (formattedUrl.includes('youtube.com') || formattedUrl.includes('youtu.be')) {
          formattedUrl = `https://${formattedUrl}`;
        }
      }
      
      console.log("Fetching missing fields for URL:", formattedUrl);
      
      // Call our function with a flag to focus on missing fields
      const { data, error } = await supabase.functions.invoke<ChannelStatsResponse>('fetch-channel-stats-apify', {
        body: { 
          channelUrl: formattedUrl,
          fetchMissingOnly: true // Modified flag name to be more generic
        }
      });

      if (error) {
        console.error("Error fetching missing fields:", error);
        setApiError(`Failed to fetch missing fields: ${error.message}`);
        toast.error(`Failed to fetch missing fields: ${error.message}`);
        return;
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || "Failed to fetch missing fields";
        console.error(errorMessage);
        setApiError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      console.log("Missing fields data received:", data);
      
      // Create an object to hold any fields that we successfully retrieved
      const partialStats: Partial<ChannelFormData> = {};
      const successfulFields: string[] = [];
      const failedFields: string[] = [];
      
      // Map from API field names to form field names
      const fieldMappings: Record<string, keyof ChannelFormData> = {
        description: 'description',
        country: 'country',
        subscriberCount: 'total_subscribers',
        viewCount: 'total_views',
        videoCount: 'video_count',
        startDate: 'start_date',
        title: 'channel_title'
      };
      
      // Check each field in the response and add to our stats object if present
      Object.entries(fieldMappings).forEach(([apiField, formField]) => {
        if (data[apiField as keyof ChannelStatsResponse] && data[apiField as keyof ChannelStatsResponse]?.toString().trim() !== "") {
          partialStats[formField] = data[apiField as keyof ChannelStatsResponse]?.toString() || "";
          successfulFields.push(apiField);
        } else if (missingFields.some(field => field.toLowerCase().includes(apiField.toLowerCase()))) {
          failedFields.push(apiField);
        }
      });
      
      // Only call onStatsReceived if we have at least one field
      if (Object.keys(partialStats).length > 0) {
        console.log("Sending partial stats with retrieved fields:", partialStats);
        onStatsReceived(partialStats);
        toast.success(`Successfully fetched: ${successfulFields.join(', ')}`);
        
        // Update missing fields list
        const updatedMissingFields = missingFields.filter(field => 
          !successfulFields.some(success => field.toLowerCase().includes(success.toLowerCase()))
        );
        setMissingFields(updatedMissingFields);
        setPartialData(updatedMissingFields.length > 0);
      } else {
        toast.warning("Could not fetch any of the missing fields");
      }
      
    } catch (err) {
      console.error("Error fetching missing fields:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setApiError(errorMessage);
      toast.error(`Failed to fetch missing fields: ${errorMessage}`);
    } finally {
      setFetchingMissing(false);
    }
  };

  return {
    loading,
    fetchingMissing,
    apiError,
    dataSource,
    partialData,
    missingFields,
    consecutiveAttempts,
    fetchStats,
    fetchMissingFields
  };
}
