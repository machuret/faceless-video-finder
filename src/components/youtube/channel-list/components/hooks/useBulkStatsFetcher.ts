
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SelectedChannel {
  id: string;
  url: string;
  title: string;
}

interface StatsResult {
  field: string;
  value: any;
  success: boolean;
}

interface ChannelStatsResult {
  channel: SelectedChannel;
  results: StatsResult[];
  error?: string;
}

interface UseBulkStatsFetcherResult {
  fetchStatsForChannels: (channels: SelectedChannel[]) => Promise<void>;
  isProcessing: boolean;
  progress: number;
  currentChannel: string | null;
  successCount: number;
  errorCount: number;
  totalCount: number;
  statsResults: ChannelStatsResult[];
  failedChannels: Array<{channel: SelectedChannel, error: string}>;
  retryFailedChannels: () => Promise<void>;
}

export function useBulkStatsFetcher(): UseBulkStatsFetcherResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [statsResults, setStatsResults] = useState<ChannelStatsResult[]>([]);
  const [failedChannels, setFailedChannels] = useState<Array<{channel: SelectedChannel, error: string}>>([]);

  const fetchStatsForSingleChannel = async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Fetching stats for channel: ${channel.title} (${channel.url})`);
      setCurrentChannel(channel.title);
      
      // Show an initial progress message for the current channel
      toast.info(`Processing stats for ${channel.title}. This may take up to 3 minutes.`);
      
      const { data, error } = await supabase.functions.invoke<any>('fetch-channel-stats-apify', {
        body: { 
          channelUrl: channel.url,
          forceRefresh: true,  // Force a fresh fetch to avoid cached results
          timestamp: Date.now() // Add timestamp to prevent caching
        }
      });

      if (error) {
        console.error(`Error fetching stats for ${channel.title}:`, error);
        const errorMessage = `API error: ${error.message}`;
        setFailedChannels(prev => [...prev, {
          channel,
          error: errorMessage
        }]);
        toast.error(`Failed to fetch stats for ${channel.title}: ${errorMessage}`);
        return false;
      }

      if (!data || !data.success) {
        console.error(`Failed to fetch stats for ${channel.title}:`, data?.error || "Unknown error");
        const errorMessage = data?.error || "Unknown error occurred";
        setFailedChannels(prev => [...prev, {
          channel,
          error: errorMessage
        }]);
        toast.error(`Failed to fetch stats for ${channel.title}: ${errorMessage}`);
        return false;
      }

      // Track which fields were successfully retrieved
      const results: StatsResult[] = [];
      const updateData: Record<string, any> = {};
      
      // Helper to add a field to both results and updateData
      const addField = (field: string, value: any, fieldSuccess: boolean = true) => {
        results.push({ field, value, success: fieldSuccess });
        if (fieldSuccess && value !== undefined && value !== null) {
          updateData[field] = value;
        }
      };
      
      // Check each field and record its status
      addField('channel_title', data.title, !!data.title);
      addField('total_subscribers', data.subscriberCount, !!data.subscriberCount);
      addField('total_views', data.viewCount, !!data.viewCount);
      addField('video_count', data.videoCount, !!data.videoCount);
      addField('start_date', data.startDate, !!data.startDate);
      addField('description', data.description, !!data.description);
      addField('country', data.country, !!data.country);
      
      // Log what fields we actually got back
      console.log(`Got fields for ${channel.title}:`, Object.keys(updateData).join(', '));
      
      // Store the results
      setStatsResults(prev => [...prev, { 
        channel,
        results,
      }]);
      
      // Only update if we have data to update
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update(updateData)
          .eq('id', channel.id);

        if (updateError) {
          console.error(`Error updating stats for ${channel.title}:`, updateError);
          setFailedChannels(prev => [...prev, {
            channel,
            error: `Database update error: ${updateError.message}`
          }]);
          toast.error(`Failed to update stats in database for ${channel.title}: ${updateError.message}`);
          return false;
        }
        
        console.log(`Successfully updated stats for ${channel.title}`);
        toast.success(`Updated ${Object.keys(updateData).length} fields for ${channel.title}`);
        return true;
      }
      
      // If we didn't have any fields to update, consider it a failure
      setFailedChannels(prev => [...prev, {
        channel,
        error: `No valid data received for the channel`
      }]);
      toast.warning(`No data fields could be retrieved for ${channel.title}`);
      return false;
    } catch (error) {
      console.error(`Exception when fetching stats for ${channel.title}:`, error);
      const errorMessage = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
      setFailedChannels(prev => [...prev, {
        channel,
        error: errorMessage
      }]);
      toast.error(`Failed to fetch stats for ${channel.title}: ${errorMessage}`);
      return false;
    }
  };

  const fetchStatsForChannels = async (channels: SelectedChannel[]) => {
    if (!channels.length) {
      toast.error("No channels selected");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setTotalCount(channels.length);
    setCurrentChannel(null);
    setStatsResults([]);
    setFailedChannels([]);

    toast.info(`Starting stats fetch for ${channels.length} channels. This may take a while.`);

    try {
      // Process channels in sequence to avoid overloading
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const success = await fetchStatsForSingleChannel(channel);
        
        if (success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
        }
        
        // Update progress
        const newProgress = Math.floor(((i + 1) / channels.length) * 100);
        setProgress(newProgress);
        
        // Add a longer delay between requests to respect rate limits
        if (i < channels.length - 1) {
          const delayMessage = "Waiting before processing next channel to respect API rate limits...";
          console.log(delayMessage);
          
          if (channels.length > 2) {
            toast.info(delayMessage);
          }
          
          await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay to 3s
        }
      }

      if (successCount === channels.length) {
        toast.success(`Successfully fetched stats for all ${channels.length} channels!`);
      } else if (successCount > 0) {
        toast.warning(
          `Stats fetch completed: ${successCount} successful, ${channels.length - successCount} failed.`
        );
      } else {
        toast.error(`Failed to fetch stats for all ${channels.length} channels. Please try again later.`);
      }
    } catch (error) {
      console.error("Error in bulk stats fetch process:", error);
      toast.error("Stats fetch process encountered an error");
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  };

  const retryFailedChannels = async () => {
    if (failedChannels.length === 0) {
      toast.info("No failed channels to retry");
      return;
    }
    
    toast.info(`Retrying ${failedChannels.length} failed channels...`);
    const channelsToRetry = failedChannels.map(item => item.channel);
    setFailedChannels([]);
    await fetchStatsForChannels(channelsToRetry);
  };

  return {
    fetchStatsForChannels,
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount,
    statsResults,
    failedChannels,
    retryFailedChannels
  };
}
