
import { toast } from "sonner";
import { updateStatsForChannel, fetchChannelsForStatsUpdate } from "./channelStatsFetcher";
import { useProgressState } from "./statsUpdateProgress";
import { useRef, useEffect, useState } from "react";

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
  
  // Track state without triggering re-renders
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Track batches to prevent restarting from beginning
  const [processedChannels, setProcessedChannels] = useState<string[]>([]);

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
    
    // Reset progress state if starting fresh (not resuming)
    if (processedChannels.length === 0) {
      updateProgress({
        isProcessing: true,
        progress: 0,
        processedChannels: 0,
        successCount: 0,
        errorCount: 0,
        currentChannel: null,
        errors: []
      });
    } else {
      updateProgress({
        isProcessing: true,
      });
    }
    
    processingRef.current = true;
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      console.log("Starting mass stats update process");
      const { channels, count } = await fetchChannelsForStatsUpdate();
      console.log(`Found ${count} channels to update`);
      
      // Filter out already processed channels if resuming
      const remainingChannels = processedChannels.length > 0 
        ? channels.filter(ch => !processedChannels.includes(ch.id))
        : channels;
      
      console.log(`Processing ${remainingChannels.length} remaining channels`);
      
      updateProgress({ 
        totalChannels: count,
        processedChannels: processedChannels.length,
      });
      
      if (remainingChannels.length === 0) {
        toast.info("No channels found missing stats");
        updateProgress({ isProcessing: false });
        processingRef.current = false;
        return;
      }

      toast.info(`Starting stats update for ${remainingChannels.length} channels with missing stats. This may take a while.`);
      
      // Process channels sequentially with error handling for each
      const batchSize = 1; // Process one at a time
      const newErrors: string[] = [];

      for (let i = 0; i < remainingChannels.length; i += batchSize) {
        // Check if operation was cancelled
        if (signal.aborted) {
          console.log("Stats update process was cancelled");
          break;
        }
        
        const batch = remainingChannels.slice(i, i + batchSize);
        
        // Process this batch sequentially
        for (const channel of batch) {
          // Check if operation was cancelled again
          if (signal.aborted) break;
          
          const channelTitle = channel.channel_title || `Channel ${i+1}`;
          console.log(`Processing channel ${processedChannels.length + i + batch.indexOf(channel) + 1}/${count}: ${channelTitle}`);
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
            
            // Add to processed channels list to enable resuming
            setProcessedChannels(prev => [...prev, channel.id]);
          } catch (error) {
            // Catch any unexpected errors
            console.error(`Exception when processing ${channelTitle}:`, error);
            incrementError();
            const errorMessage = `Channel ${channelTitle}: ${error instanceof Error ? error.message : String(error)}`;
            newErrors.push(errorMessage);
            addError(errorMessage);
            
            // Still add to processed to avoid getting stuck
            setProcessedChannels(prev => [...prev, channel.id]);
          }
          
          // Update processed count regardless of success or failure
          const newProcessedCount = processedChannels.length + i + batch.indexOf(channel) + 1;
          updateProcessedCount(newProcessedCount);
          
          // Calculate and update progress
          const newProgress = Math.floor((newProcessedCount / count) * 100);
          updateProgress({ progress: newProgress });
          
          // Show periodic progress updates (reduced frequency to avoid toast flooding)
          if ((newProcessedCount % 10 === 0) || newProcessedCount === count) {
            toast.info(`Progress: ${newProcessedCount}/${count} channels processed`);
          }
          
          // Delay between each channel to avoid API rate limits
          if (!signal.aborted && (i + batch.indexOf(channel) + 1 < remainingChannels.length)) {
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
      toast.error(`Stats update process encountered an error: ${error instanceof Error ? error.message : String(error)}`);
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
  
  const resetUpdateProcess = () => {
    // Clear the processed channels to start from beginning
    setProcessedChannels([]);
    resetProgress();
    toast.info("Stats update process reset");
  };

  return {
    ...state,
    startMassUpdate,
    cancelUpdate,
    resetUpdateProcess
  };
};
