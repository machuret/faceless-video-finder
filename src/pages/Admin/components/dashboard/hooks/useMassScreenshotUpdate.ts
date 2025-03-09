
import { useState, useRef } from "react";
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
  const [errors, setErrors] = useState<string[]>([]);
  
  // Use refs to track state that shouldn't trigger re-renders
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchChannelsWithoutScreenshots = async () => {
    try {
      // Improved query to detect channels without screenshots
      const { data, error, count } = await supabase
        .from('youtube_channels')
        .select('id, channel_url, channel_title', { count: 'exact' })
        .or('screenshot_url.is.null,screenshot_url.eq.')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log(`Found ${count || 0} channels without screenshots`);
      console.log("Sample channels:", data?.slice(0, 3));
      return { channels: data || [], count: count || 0 };
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
    // Prevent multiple simultaneous runs
    if (processingRef.current) {
      toast.info("Update already in progress");
      return;
    }
    
    setIsProcessing(true);
    processingRef.current = true;
    setProgress(0);
    setProcessedChannels(0);
    setErrors([]);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const { channels, count } = await fetchChannelsWithoutScreenshots();
      setTotalChannels(count);
      
      if (channels.length === 0) {
        toast.info("No channels found without screenshots");
        setIsProcessing(false);
        processingRef.current = false;
        return;
      }

      toast.info(`Starting screenshot update for ${channels.length} channels without screenshots. This may take a while.`);
      
      // Process channels in smaller batches to avoid memory issues and timeouts
      const batchSize = 2; // Reduced to 2 to be very conservative
      const results = { success: 0, failed: 0 };
      const newErrors: string[] = [];
      
      for (let i = 0; i < channels.length; i += batchSize) {
        // Check if operation was cancelled
        if (signal.aborted) {
          console.log("Screenshot update process was cancelled");
          break;
        }
        
        const batch = channels.slice(i, i + batchSize);
        
        // Process this batch sequentially to avoid overwhelming the service
        for (const channel of batch) {
          // Check if operation was cancelled
          if (signal.aborted) break;
          
          try {
            console.log(`Processing channel ${channel.id}: ${channel.channel_title || channel.channel_url}`);
            
            const result = await updateScreenshot(channel.id, channel.channel_url);
            
            if (result.success) {
              results.success++;
            } else {
              results.failed++;
              const errorMsg = `Channel ${channel.channel_title || channel.channel_url}: ${result.message}`;
              console.warn(errorMsg);
              newErrors.push(errorMsg);
            }
            
            // Update progress after each channel
            const newProcessedCount = i + batch.indexOf(channel) + 1;
            setProcessedChannels(newProcessedCount);
            setProgress(Math.floor((newProcessedCount / channels.length) * 100));
            
            // Show intermediate progress notifications
            if (newProcessedCount % 10 === 0 || newProcessedCount === channels.length) {
              toast.info(`Progress: ${newProcessedCount}/${channels.length} channels processed`);
            }
            
            // Small delay between each channel to avoid rate limiting
            if (!signal.aborted) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            // Catch any unexpected errors at the channel level to prevent the entire process from failing
            console.error(`Unexpected error processing channel ${channel.id}:`, error);
            results.failed++;
            newErrors.push(`Channel ${channel.channel_title || channel.channel_url}: Unexpected error`);
            
            // Still update progress
            setProcessedChannels(prev => prev + 1);
            setProgress(Math.floor(((i + batch.indexOf(channel) + 1) / channels.length) * 100));
          }
        }
        
        // Update errors state
        setErrors(newErrors);
        
        // Longer delay between batches to allow system resources to recover
        if (i + batchSize < channels.length && !signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      // Show final results only if not aborted
      if (!signal.aborted) {
        if (results.failed > 0) {
          toast.warning(
            `Screenshot update completed: ${results.success} successful, ${results.failed} failed. Check errors for details.`
          );
        } else {
          toast.success(`Successfully updated screenshots for all ${results.success} channels!`);
        }
      }
    } catch (error) {
      console.error("Error in mass screenshot update:", error);
      toast.error("Screenshot update process encountered an error");
    } finally {
      // Only if this specific process is still the active one
      if (processingRef.current) {
        setIsProcessing(false);
        processingRef.current = false;
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
    }
  };

  return {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    errors,
    startMassUpdate,
    cancelUpdate
  };
};
