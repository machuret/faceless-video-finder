
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScreenshotUpdateResult {
  success: boolean;
  message: string;
}

export const useMassScreenshotUpdate = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalChannels, setTotalChannels] = useState(0);
  const [processedChannels, setProcessedChannels] = useState(0);

  const fetchChannelsWithoutScreenshots = async () => {
    try {
      const { data, error, count } = await supabase
        .from('youtube_channels')
        .select('id, channel_url', { count: 'exact' })
        .is('screenshot_url', null)
        .or('screenshot_url.eq.');
      
      if (error) throw error;
      return { channels: data, count: count || 0 };
    } catch (error) {
      console.error("Error fetching channels without screenshots:", error);
      toast.error("Failed to fetch channels");
      return { channels: [], count: 0 };
    }
  };

  const updateScreenshot = async (channelId: string, channelUrl: string): Promise<ScreenshotUpdateResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: {
          channelUrl,
          channelId
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        return { success: true, message: `Updated screenshot for channel ${channelId}` };
      } else {
        return { 
          success: false, 
          message: data?.error || "Screenshot update failed without specific error"
        };
      }
    } catch (error) {
      console.error(`Error updating screenshot for channel ${channelId}:`, error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  };

  const startMassUpdate = async () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessedChannels(0);
    
    try {
      const { channels, count } = await fetchChannelsWithoutScreenshots();
      setTotalChannels(count);
      
      if (channels.length === 0) {
        toast.info("No channels found without screenshots");
        setIsProcessing(false);
        return;
      }

      toast.info(`Starting screenshot update for ${channels.length} channels without screenshots. This may take a while.`);
      
      // Process channels in batches to avoid overloading the server
      const batchSize = 5;
      const results = { success: 0, failed: 0 };
      
      for (let i = 0; i < channels.length; i += batchSize) {
        const batch = channels.slice(i, i + batchSize);
        
        // Update screenshots for this batch in parallel
        const batchPromises = batch.map(channel => 
          updateScreenshot(channel.id, channel.channel_url)
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        // Count successes and failures
        batchResults.forEach(result => {
          if (result.success) {
            results.success++;
          } else {
            results.failed++;
            console.warn(result.message);
          }
        });
        
        // Update progress
        const processed = Math.min(i + batchSize, channels.length);
        setProcessedChannels(processed);
        setProgress(Math.floor((processed / channels.length) * 100));
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < channels.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Show final results
      if (results.failed > 0) {
        toast.warning(
          `Screenshot update completed: ${results.success} successful, ${results.failed} failed. Check console for details.`
        );
      } else {
        toast.success(`Successfully updated screenshots for all ${results.success} channels!`);
      }
    } catch (error) {
      console.error("Error in mass screenshot update:", error);
      toast.error("Screenshot update process encountered an error");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    startMassUpdate
  };
};
