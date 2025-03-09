
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
      // Modified query to properly detect channels without screenshots
      // The OR condition now checks for null, empty string, or non-existent screenshot_url
      const { data, error, count } = await supabase
        .from('youtube_channels')
        .select('id, channel_url, channel_title', { count: 'exact' })
        .or('screenshot_url.is.null,screenshot_url.eq.')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log(`Found ${count || 0} channels without screenshots`);
      console.log("Sample channels:", data?.slice(0, 3));
      return { channels: data, count: count || 0 };
    } catch (error) {
      console.error("Error fetching channels without screenshots:", error);
      toast.error("Failed to fetch channels");
      return { channels: [], count: 0 };
    }
  };

  const updateScreenshot = async (channelId: string, channelUrl: string): Promise<ScreenshotUpdateResult> => {
    try {
      console.log(`Updating screenshot for channel ${channelId}: ${channelUrl}`);
      
      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: {
          channelUrl,
          channelId
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        console.log(`Successfully updated screenshot for channel ${channelId}`);
        return { success: true, message: `Updated screenshot for channel ${channelId}` };
      } else {
        console.error(`Failed to update screenshot for channel ${channelId}:`, data?.error);
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
      const batchSize = 3; // Reduced from 5 to 3 to avoid rate limiting
      const results = { success: 0, failed: 0 };
      
      for (let i = 0; i < channels.length; i += batchSize) {
        const batch = channels.slice(i, i + batchSize);
        
        // Process this batch sequentially to avoid overwhelming the screenshot service
        for (const channel of batch) {
          console.log(`Processing channel ${channel.id}: ${channel.channel_title || channel.channel_url}`);
          
          const result = await updateScreenshot(channel.id, channel.channel_url);
          
          if (result.success) {
            results.success++;
          } else {
            results.failed++;
            console.warn(result.message);
          }
          
          // Update progress after each channel
          setProcessedChannels(prev => prev + 1);
          setProgress(Math.floor(((i + batch.indexOf(channel) + 1) / channels.length) * 100));
          
          // Small delay between each channel to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Longer delay between batches
        if (i + batchSize < channels.length) {
          await new Promise(resolve => setTimeout(resolve, 3000));
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
