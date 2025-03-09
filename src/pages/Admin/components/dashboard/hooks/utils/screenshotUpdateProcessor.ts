
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProgressState } from "./screenshotUpdateProgress";
import { useRef, useEffect } from "react";

interface ChannelForScreenshot {
  id: string;
  channel_url: string;
  channel_title: string | null;
}

export const useScreenshotUpdateProcessor = () => {
  const {
    state,
    updateProgress,
    incrementSuccess,
    incrementError,
    addError,
    updateProcessedCount,
    setCurrentChannel
  } = useProgressState();
  
  // Use refs to track state that shouldn't trigger re-renders
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        processingRef.current = false;
      }
    };
  }, []);

  const fetchChannelsWithoutScreenshots = async (): Promise<{ channels: ChannelForScreenshot[], count: number }> => {
    try {
      const { data, error, count } = await supabase
        .from('youtube_channels')
        .select('id, channel_url, channel_title', { count: 'exact' })
        .is('screenshot_url', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log(`Found ${count || 0} channels without screenshots`);
      console.log("Sample channels:", data?.slice(0, 3));
      return { channels: data || [], count: count || 0 };
    } catch (error) {
      console.error("Error fetching channels without screenshots:", error);
      return { channels: [], count: 0 };
    }
  };

  const updateScreenshot = async (channel: ChannelForScreenshot): Promise<{ success: boolean; message: string }> => {
    try {
      console.log(`Processing channel ${channel.id}: ${channel.channel_title}`);
      console.log(`Updating screenshot for channel ${channel.id}: ${channel.channel_url} (${channel.channel_title})`);
      
      // Add timeout for the fetch operation to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for screenshots
      
      try {
        const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
          body: { channelId: channel.id, channelUrl: channel.channel_url },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (error) {
          console.error(`Error updating screenshot for channel ${channel.id}:`, error);
          return { success: false, message: error.message };
        }

        if (!data?.success) {
          console.error(`Failed to update screenshot for channel ${channel.id}:`, data?.error || "Unknown error");
          return { success: false, message: data?.error || "Unknown error" };
        }

        console.log(`Successfully updated screenshot for channel ${channel.id}`);
        return { success: true, message: `Updated screenshot for ${channel.channel_title || "channel"}` };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      // Check if this is an abort error (timeout)
      if (error.name === 'AbortError') {
        const message = `Timeout waiting for Apify run to complete`;
        console.error(`Failed to update screenshot for channel ${channel.id}:`, message);
        return { success: false, message };
      }
      
      console.error(`Error updating screenshot for channel ${channel.id}:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  };

  const startMassUpdate = async () => {
    // Prevent multiple simultaneous runs
    if (processingRef.current) {
      toast.info("Screenshot update already in progress");
      return;
    }
    
    updateProgress({
      isProcessing: true,
      progress: 0,
      processedChannels: 0,
      successCount: 0,
      errorCount: 0,
      currentChannel: null,
      errors: []
    });
    
    processingRef.current = true;
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const { channels, count } = await fetchChannelsWithoutScreenshots();
      updateProgress({ totalChannels: count });
      
      if (channels.length === 0) {
        toast.info("No channels found without screenshots");
        updateProgress({ isProcessing: false });
        processingRef.current = false;
        return;
      }

      toast.info(`Starting screenshot update for ${channels.length} channels. This may take a while.`);

      // Process one channel at a time
      for (let i = 0; i < channels.length; i++) {
        // Check if operation was cancelled
        if (signal.aborted) {
          console.log("Screenshot update process was cancelled");
          break;
        }
        
        const channel = channels[i];
        const channelTitle = channel.channel_title || `Channel ${i+1}`;
        
        try {
          setCurrentChannel(channelTitle);
          
          // Wrap in try/catch to prevent a single channel failure from stopping the process
          let result;
          try {
            result = await updateScreenshot(channel);
          } catch (updateError) {
            console.error(`Error processing screenshot for ${channelTitle}:`, updateError);
            result = {
              success: false,
              message: `Error processing screenshot for ${channelTitle}: ${updateError instanceof Error ? updateError.message : String(updateError)}`
            };
          }
          
          if (result.success) {
            incrementSuccess();
          } else {
            incrementError();
            console.warn(result.message);
            addError(result.message);
          }
          
          // Update processed count
          updateProcessedCount(i + 1);
          
          // Show periodic progress updates (reduced frequency to avoid toast flooding)
          if (((i + 1) % 10 === 0) || (i + 1 === channels.length)) {
            toast.info(`Progress: ${i + 1}/${channels.length} screenshots processed`);
          }
        } catch (error) {
          // Catch any unexpected errors to prevent the entire process from failing
          console.error(`Unexpected error processing channel:`, error);
          incrementError();
          addError(`Channel ${channelTitle}: ${error instanceof Error ? error.message : String(error)}`);
          
          // Still update progress
          updateProcessedCount(i + 1);
        }
        
        // Add delay between processing channels
        if (i < channels.length - 1 && !signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      // Show final results only if not aborted
      if (!signal.aborted) {
        if (state.errorCount > 0) {
          toast.warning(
            `Screenshot update completed: ${state.successCount} successful, ${state.errorCount} failed. Check errors for details.`
          );
        } else {
          toast.success(`Successfully updated screenshots for all ${state.successCount} channels!`);
        }
      }
    } catch (error) {
      console.error("Error in mass screenshot update:", error);
      toast.error("Screenshot update process encountered an error");
      // Don't reset processing state here, let the finally block handle it
    } finally {
      // Only if this specific process is still the active one
      if (processingRef.current) {
        updateProgress({ isProcessing: false });
        processingRef.current = false;
        setCurrentChannel(null);
        abortControllerRef.current = null;
      }
    }
  };

  const cancelUpdate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info("Screenshot update process cancelled");
      updateProgress({ isProcessing: false });
      processingRef.current = false;
      setCurrentChannel(null);
    }
  };

  return {
    ...state,
    startMassUpdate,
    cancelUpdate
  };
};
