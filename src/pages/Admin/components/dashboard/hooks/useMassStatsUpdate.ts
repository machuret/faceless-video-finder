
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StatsUpdateResult {
  success: boolean;
  message: string;
}

export const useMassStatsUpdate = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalChannels, setTotalChannels] = useState(0);
  const [processedChannels, setProcessedChannels] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  const fetchChannelsForStatsUpdate = async () => {
    try {
      const { data, error, count } = await supabase
        .from('youtube_channels')
        .select('id, channel_url, channel_title', { count: 'exact' });
      
      if (error) throw error;
      return { channels: data, count: count || 0 };
    } catch (error) {
      console.error("Error fetching channels for stats update:", error);
      toast.error("Failed to fetch channels");
      return { channels: [], count: 0 };
    }
  };

  const updateStatsForChannel = async (channelId: string, channelUrl: string, channelTitle: string): Promise<StatsUpdateResult> => {
    try {
      console.log(`Fetching stats for channel: ${channelTitle} (${channelUrl})`);
      setCurrentChannel(channelTitle);
      
      const { data, error } = await supabase.functions.invoke<any>('fetch-channel-stats-apify', {
        body: { channelUrl }
      });

      if (error) {
        console.error(`Error fetching stats for ${channelTitle}:`, error);
        return { 
          success: false, 
          message: `Failed to fetch stats for ${channelTitle}: ${error.message}`
        };
      }

      if (!data || !data.success) {
        console.error(`Failed to fetch stats for ${channelTitle}:`, data?.error || "Unknown error");
        return { 
          success: false, 
          message: `Failed to fetch stats for ${channelTitle}: ${data?.error || "Unknown error"}`
        };
      }

      // Prepare data for update
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
          .eq('id', channelId);

        if (updateError) {
          console.error(`Error updating stats for ${channelTitle}:`, updateError);
          return { 
            success: false, 
            message: `Error updating stats for ${channelTitle}: ${updateError.message}`
          };
        }
        
        console.log(`Successfully updated stats for ${channelTitle}`);
        return { 
          success: true, 
          message: `Successfully updated stats for ${channelTitle}`
        };
      }
      
      return { 
        success: false, 
        message: `No valid data received for ${channelTitle}`
      };
    } catch (error) {
      console.error(`Exception when updating stats for ${channelTitle}:`, error);
      return { 
        success: false, 
        message: `Error updating stats for ${channelTitle}: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  };

  const startMassUpdate = async () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessedChannels(0);
    setSuccessCount(0);
    setErrorCount(0);
    setCurrentChannel(null);
    
    try {
      const { channels, count } = await fetchChannelsForStatsUpdate();
      setTotalChannels(count);
      
      if (channels.length === 0) {
        toast.info("No channels found to update");
        setIsProcessing(false);
        return;
      }

      toast.info(`Starting stats update for ${channels.length} channels. This may take a while.`);
      
      // Process channels in batches to avoid overloading the server
      const batchSize = 3;
      
      for (let i = 0; i < channels.length; i += batchSize) {
        const batch = channels.slice(i, i + batchSize);
        
        // Update stats for this batch in sequence (not parallel to avoid rate limits)
        for (const channel of batch) {
          const result = await updateStatsForChannel(
            channel.id, 
            channel.channel_url,
            channel.channel_title || `Channel ${i+1}`
          );
          
          if (result.success) {
            setSuccessCount(prev => prev + 1);
          } else {
            setErrorCount(prev => prev + 1);
            console.warn(result.message);
          }
          
          // Update processed count
          setProcessedChannels(prev => prev + 1);
          setProgress(Math.floor(((i + 1) / channels.length) * 100));
        }
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < channels.length) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // Show final results
      if (errorCount > 0) {
        toast.warning(
          `Stats update completed: ${successCount} successful, ${errorCount} failed. Check console for details.`
        );
      } else {
        toast.success(`Successfully updated stats for all ${successCount} channels!`);
      }
    } catch (error) {
      console.error("Error in mass stats update:", error);
      toast.error("Stats update process encountered an error");
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  };

  return {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    successCount,
    errorCount,
    currentChannel,
    startMassUpdate
  };
};
