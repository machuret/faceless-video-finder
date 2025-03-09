
import { useState, useRef } from "react";
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
  
  // Use refs to track state that shouldn't trigger re-renders
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchChannelsForStatsUpdate = async () => {
    try {
      // Improved query to find channels missing any of the important stats
      const { data, error, count } = await supabase
        .from('youtube_channels')
        .select('id, channel_url, channel_title', { count: 'exact' })
        .or('total_subscribers.is.null,total_views.is.null,video_count.is.null,description.is.null')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log(`Found ${count || 0} channels missing stats`);
      console.log("Sample channels with missing stats:", data?.slice(0, 3));
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

      console.log(`Received stats for ${channelTitle}:`, data);

      // Prepare data for update
      const updateData: Record<string, any> = {};
      
      if (data.title) updateData.channel_title = data.title;
      if (data.subscriberCount !== undefined) updateData.total_subscribers = data.subscriberCount;
      if (data.viewCount !== undefined) updateData.total_views = data.viewCount;
      if (data.videoCount !== undefined) updateData.video_count = data.videoCount;
      if (data.startDate) updateData.start_date = data.startDate;
      if (data.description) updateData.description = data.description;
      if (data.country) updateData.country = data.country;
      
      console.log(`Update data prepared for ${channelTitle}:`, updateData);
      
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
    // Prevent multiple simultaneous runs
    if (processingRef.current) {
      toast.info("Update already in progress");
      return;
    }
    
    setIsProcessing(true);
    processingRef.current = true;
    setProgress(0);
    setProcessedChannels(0);
    setSuccessCount(0);
    setErrorCount(0);
    setCurrentChannel(null);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const { channels, count } = await fetchChannelsForStatsUpdate();
      setTotalChannels(count);
      
      if (channels.length === 0) {
        toast.info("No channels found missing stats");
        setIsProcessing(false);
        processingRef.current = false;
        return;
      }

      toast.info(`Starting stats update for ${channels.length} channels with missing stats. This may take a while.`);
      
      // Process channels one at a time to avoid API rate limits
      for (let i = 0; i < channels.length; i++) {
        // Check if operation was cancelled
        if (signal.aborted) {
          console.log("Stats update process was cancelled");
          break;
        }
        
        const channel = channels[i];
        
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
        setProcessedChannels(i + 1);
        setProgress(Math.floor(((i + 1) / channels.length) * 100));
        
        // Show periodic progress updates
        if ((i + 1) % 5 === 0 || i === channels.length - 1) {
          toast.info(`Progress: ${i + 1}/${channels.length} channels processed`);
        }
        
        // Delay between each channel to avoid API rate limits
        if (i + 1 < channels.length && !signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      // Show final results only if not aborted
      if (!signal.aborted) {
        if (errorCount > 0) {
          toast.warning(
            `Stats update completed: ${successCount} successful, ${errorCount} failed. Check console for details.`
          );
        } else {
          toast.success(`Successfully updated stats for all ${successCount} channels!`);
        }
      }
    } catch (error) {
      console.error("Error in mass stats update:", error);
      toast.error("Stats update process encountered an error");
    } finally {
      // Only if this specific process is still the active one
      if (processingRef.current) {
        setIsProcessing(false);
        processingRef.current = false;
        setCurrentChannel(null);
        abortControllerRef.current = null;
      }
    }
  };

  const cancelUpdate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info("Update process cancelled");
      setIsProcessing(false);
      processingRef.current = false;
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
    startMassUpdate,
    cancelUpdate
  };
};
