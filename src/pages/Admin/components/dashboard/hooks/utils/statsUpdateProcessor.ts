
import { toast } from "sonner";
import { updateStatsForChannel, fetchChannelsForStatsUpdate } from "./channelStatsFetcher";
import { useProgressState } from "./statsUpdateProgress";
import { useRef, useEffect } from "react";

export const useStatsUpdateProcessor = () => {
  const {
    state,
    resetProgress,
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

  const startMassUpdate = async () => {
    // Prevent multiple simultaneous runs
    if (processingRef.current) {
      toast.info("Update already in progress");
      return;
    }
    
    // Reset progress state
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
      console.log("Starting mass stats update process");
      const { channels, count } = await fetchChannelsForStatsUpdate();
      console.log(`Found ${count} channels to update`);
      
      updateProgress({ totalChannels: count });
      
      if (channels.length === 0) {
        toast.info("No channels found missing stats");
        updateProgress({ isProcessing: false });
        processingRef.current = false;
        return;
      }

      toast.info(`Starting stats update for ${channels.length} channels with missing stats. This may take a while.`);
      
      // Process channels sequentially with error handling for each
      const batchSize = 1; // Process one at a time
      const newErrors: string[] = [];

      for (let i = 0; i < channels.length; i += batchSize) {
        // Check if operation was cancelled
        if (signal.aborted) {
          console.log("Stats update process was cancelled");
          break;
        }
        
        const batch = channels.slice(i, i + batchSize);
        
        // Process this batch sequentially
        for (const channel of batch) {
          // Check if operation was cancelled again
          if (signal.aborted) break;
          
          const channelTitle = channel.channel_title || `Channel ${i+1}`;
          console.log(`Processing channel ${i+1}/${channels.length}: ${channelTitle}`);
          setCurrentChannel(channelTitle);
          
          try {
            // Wrap the update in a try/catch to prevent the whole process from failing
            const result = await updateStatsForChannel(
              channel.id, 
              channel.channel_url,
              channelTitle
            );
            
            if (result.success) {
              incrementSuccess();
              console.log(`Successfully updated stats for ${channelTitle}`);
            } else {
              incrementError();
              newErrors.push(result.message);
              console.warn(`Failed to update stats for ${channelTitle}: ${result.message}`);
              addError(result.message);
            }
          } catch (error) {
            // Catch any unexpected errors
            console.error(`Exception when processing ${channelTitle}:`, error);
            incrementError();
            const errorMessage = `Channel ${channelTitle}: ${error instanceof Error ? error.message : String(error)}`;
            newErrors.push(errorMessage);
            addError(errorMessage);
          }
          
          // Update processed count regardless of success or failure
          const newProcessedCount = i + batch.indexOf(channel) + 1;
          updateProcessedCount(newProcessedCount);
          
          // Calculate and update progress
          const newProgress = Math.floor((newProcessedCount / channels.length) * 100);
          updateProgress({ progress: newProgress });
          
          // Show periodic progress updates (reduced frequency to avoid toast flooding)
          if ((newProcessedCount % 10 === 0) || newProcessedCount === channels.length) {
            toast.info(`Progress: ${newProcessedCount}/${channels.length} channels processed`);
          }
          
          // Delay between each channel to avoid API rate limits
          if (!signal.aborted && i + batch.indexOf(channel) + 1 < channels.length) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      // Show final results only if not aborted
      if (!signal.aborted) {
        if (state.errorCount > 0) {
          toast.warning(
            `Stats update completed: ${state.successCount} successful, ${state.errorCount} failed. Check errors for details.`
          );
        } else {
          toast.success(`Successfully updated stats for all ${state.successCount} channels!`);
        }
      }
    } catch (error) {
      console.error("Error in mass stats update:", error);
      toast.error("Stats update process encountered an error");
    } finally {
      // Always clean up, even if there was an error
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
      toast.info("Update process cancelled");
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
