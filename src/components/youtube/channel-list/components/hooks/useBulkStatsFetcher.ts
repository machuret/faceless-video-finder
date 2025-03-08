
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SelectedChannel {
  id: string;
  url: string;
  title: string;
}

interface UseBulkStatsFetcherResult {
  fetchStatsForChannels: (channels: SelectedChannel[]) => Promise<void>;
  isProcessing: boolean;
  progress: number;
  currentChannel: string | null;
  successCount: number;
  errorCount: number;
  totalCount: number;
}

export function useBulkStatsFetcher(): UseBulkStatsFetcherResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStatsForSingleChannel = async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Fetching stats for channel: ${channel.title} (${channel.url})`);
      setCurrentChannel(channel.title);
      
      const { data, error } = await supabase.functions.invoke<any>('fetch-channel-stats-apify', {
        body: { channelUrl: channel.url }
      });

      if (error) {
        console.error(`Error fetching stats for ${channel.title}:`, error);
        return false;
      }

      if (!data || !data.success) {
        console.error(`Failed to fetch stats for ${channel.title}:`, data?.error || "Unknown error");
        return false;
      }

      // If successful, update the channel with the new stats
      const updateData: Record<string, any> = {};
      
      if (data.title) updateData.channel_title = data.title;
      if (data.subscriberCount) updateData.total_subscribers = data.subscriberCount;
      if (data.viewCount) updateData.total_views = data.viewCount;
      if (data.videoCount) updateData.video_count = data.videoCount;
      if (data.startDate) updateData.start_date = data.startDate;
      if (data.description) updateData.description = data.description;
      if (data.country) updateData.country = data.country;
      
      // Only update if we have data to update
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update(updateData)
          .eq('id', channel.id);

        if (updateError) {
          console.error(`Error updating stats for ${channel.title}:`, updateError);
          return false;
        }
        
        console.log(`Successfully updated stats for ${channel.title}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Exception when fetching stats for ${channel.title}:`, error);
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
        
        // Add a small delay between requests to be nice to the API
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successCount = channels.filter((_, i) => i < channels.length).length;
      
      if (successCount === channels.length) {
        toast.success(`Successfully fetched stats for all ${channels.length} channels!`);
      } else {
        toast.warning(
          `Stats fetch completed: ${successCount} successful, ${channels.length - successCount} failed.`
        );
      }
    } catch (error) {
      console.error("Error in bulk stats fetch process:", error);
      toast.error("Stats fetch process encountered an error");
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  };

  return {
    fetchStatsForChannels,
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount
  };
}
