
import { toast } from "sonner";
import { useRef, useEffect } from "react";
import { screenshotApiService, ChannelForScreenshot } from "../services/screenshotApiService";
import { useProgressState, ProgressState } from "../screenshotUpdateProgress";

/**
 * Controller for handling the screenshot update process
 */
export const useScreenshotUpdateController = () => {
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

  /**
   * Start the mass screenshot update process
   */
  const startMassUpdate = async () => {
    // Prevent multiple simultaneous runs
    if (processingRef.current) {
      toast.info("Screenshot update already in progress");
      return;
    }
    
    updateProgress({
      isActive: true,
      progress: 0,
      processedCount: 0,
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
      const { channels, count } = await screenshotApiService.fetchChannelsWithoutScreenshots();
      updateProgress({ totalCount: count });
      
      if (channels.length === 0) {
        toast.info("No channels found without screenshots");
        updateProgress({ isActive: false });
        processingRef.current = false;
        return;
      }

      toast.info(`Starting screenshot update for ${channels.length} channels. This may take a while.`);

      await processChannels(channels, signal);
      
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
        updateProgress({ isActive: false });
        processingRef.current = false;
        setCurrentChannel(null);
        abortControllerRef.current = null;
      }
    }
  };

  /**
   * Process channels one by one
   */
  const processChannels = async (channels: ChannelForScreenshot[], signal: AbortSignal) => {
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
          result = await screenshotApiService.updateScreenshot(channel);
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
  };

  /**
   * Cancel the update process
   */
  const cancelUpdate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info("Screenshot update process cancelled");
      updateProgress({ isActive: false });
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
