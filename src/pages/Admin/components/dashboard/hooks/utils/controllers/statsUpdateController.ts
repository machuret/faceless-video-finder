
import { toast } from "sonner";
import { 
  fetchChannelsForStatsUpdate, 
  updateStatsForChannel 
} from "../channelStatsFetcher";
import { useRef, useEffect, useState } from "react";
import { ProgressState } from "../statsUpdateProgress";

/**
 * Controller for the stats update process
 */
export const useStatsUpdateController = (progressManager: {
  updateProgress: (partialState: Partial<ProgressState>) => void;
  setCurrentChannel: (channel: string | null) => void;
  incrementSuccess: () => void;
  incrementError: () => void;
  addError: (error: string) => void;
  state: ProgressState;
}) => {
  // Track state without triggering re-renders
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Track batches to prevent restarting from beginning
  const [processedChannels, setProcessedChannels] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [totalChannels, setTotalChannels] = useState(0);

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
      progressManager.updateProgress({
        isActive: true,
        progress: 0,
        processedCount: 0,
        successCount: 0,
        errorCount: 0,
        currentChannel: null,
        totalCount: 0
      });
    } else {
      progressManager.updateProgress({
        isActive: true,
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
      
      // Set total channels
      setTotalChannels(count);
      
      // Filter out already processed channels if resuming
      const remainingChannels = processedChannels.length > 0 
        ? channels.filter(ch => !processedChannels.includes(ch.id))
        : channels;
      
      console.log(`Processing ${remainingChannels.length} remaining channels`);
      
      progressManager.updateProgress({ 
        totalCount: count,
        processedCount: processedChannels.length,
      });
      
      if (remainingChannels.length === 0) {
        toast.info("No channels found missing stats");
        progressManager.updateProgress({ isActive: false });
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
          progressManager.setCurrentChannel(channelTitle);
          
          try {
            // Wrap the update in a try/catch to prevent the whole process from failing
            const result = await updateStatsForChannel(
              channel.id, 
              channel.channel_url,
              channelTitle
            );
            
            if (result.success) {
              progressManager.incrementSuccess();
              console.log(`Successfully updated stats for ${channelTitle}`);
            } else {
              progressManager.incrementError();
              newErrors.push(result.message);
              console.warn(`Failed to update stats for ${channelTitle}: ${result.message}`);
              progressManager.addError(result.message);
            }
            
            // Add to processed channels list to enable resuming
            setProcessedChannels(prev => [...prev, channel.id]);
          } catch (error) {
            // Catch any unexpected errors
            console.error(`Exception when processing ${channelTitle}:`, error);
            progressManager.incrementError();
            const errorMessage = `Channel ${channelTitle}: ${error instanceof Error ? error.message : String(error)}`;
            newErrors.push(errorMessage);
            progressManager.addError(errorMessage);
            
            // Still add to processed to avoid getting stuck
            setProcessedChannels(prev => [...prev, channel.id]);
          }
          
          // Update processed count regardless of success or failure
          const newProcessedCount = processedChannels.length + i + batch.indexOf(channel) + 1;
          progressManager.updateProgress({ processedCount: newProcessedCount });
          
          // Calculate and update progress
          const newProgress = Math.floor((newProcessedCount / count) * 100);
          progressManager.updateProgress({ progress: newProgress });
          
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
      
      // Update errors state
      setErrors(newErrors);
      
      // Show final results only if not aborted
      if (!signal.aborted) {
        if (progressManager.state.errorCount > 0) {
          toast.warning(
            `Stats update completed: ${progressManager.state.successCount} successful, ${progressManager.state.errorCount} failed. Check errors for details.`
          );
        } else {
          toast.success(`Successfully updated stats for all ${progressManager.state.successCount} channels!`);
        }
      }
    } catch (error) {
      console.error("Error in mass stats update:", error);
      toast.error(`Stats update process encountered an error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      // Always clean up, even if there was an error
      if (processingRef.current) {
        progressManager.updateProgress({ isActive: false });
        processingRef.current = false;
        progressManager.setCurrentChannel(null);
        abortControllerRef.current = null;
      }
    }
  };

  const cancelUpdate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info("Update process cancelled");
      progressManager.updateProgress({ isActive: false });
      processingRef.current = false;
      progressManager.setCurrentChannel(null);
    }
  };
  
  const resetUpdateProcess = () => {
    // Clear the processed channels to start from beginning
    setProcessedChannels([]);
    setErrors([]);
    return;
  };

  return {
    startMassUpdate,
    cancelUpdate,
    resetUpdateProcess,
    errors,
    totalChannels,
    processedChannels: processedChannels.length,
    state: progressManager.state
  };
};
