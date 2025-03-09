
import { toast } from "sonner";
import { updateStatsForChannel, fetchChannelsForStatsUpdate, type ChannelForUpdate } from "./channelStatsFetcher";
import { useProgressState, type ProgressState } from "./statsUpdateProgress";
import { useRef, useEffect } from "react";
import { calculateProgress } from "./progressUtils";

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
      const { channels, count } = await fetchChannelsForStatsUpdate();
      updateProgress({ totalChannels: count });
      
      if (channels.length === 0) {
        toast.info("No channels found missing stats");
        updateProgress({ isProcessing: false });
        processingRef.current = false;
        return;
      }

      toast.info(`Starting stats update for ${channels.length} channels with missing stats. This may take a while.`);
      
      // Process channels in small batches to avoid timeouts
      const batchSize = 1; // Process one at a time to avoid overwhelming the server
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
          // Check if operation was cancelled
          if (signal.aborted) break;
          
          try {
            const channelTitle = channel.channel_title || `Channel ${i+1}`;
            setCurrentChannel(channelTitle);
            
            const result = await updateStatsForChannel(
              channel.id, 
              channel.channel_url,
              channelTitle
            );
            
            if (result.success) {
              incrementSuccess();
            } else {
              incrementError();
              newErrors.push(result.message);
              console.warn(result.message);
              addError(result.message);
            }
            
            // Update processed count
            const newProcessedCount = i + batch.indexOf(channel) + 1;
            updateProcessedCount(newProcessedCount);
            
            // Show periodic progress updates
            if ((newProcessedCount % 5 === 0) || newProcessedCount === channels.length) {
              toast.info(`Progress: ${newProcessedCount}/${channels.length} channels processed`);
            }
            
            // Delay between each channel to avoid API rate limits
            if (!signal.aborted && i + 1 < channels.length) {
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          } catch (error) {
            // Catch any unexpected errors to prevent the entire process from failing
            console.error(`Unexpected error processing channel:`, error);
            incrementError();
            const errorMessage = `Channel ${channel.channel_title || channel.id}: Unexpected error`;
            newErrors.push(errorMessage);
            addError(errorMessage);
            
            // Still update progress
            const newProcessedCount = i + batch.indexOf(channel) + 1;
            updateProcessedCount(newProcessedCount);
          }
        }
        
        // Longer delay between batches
        if (i + batchSize < channels.length && !signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 5000));
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
