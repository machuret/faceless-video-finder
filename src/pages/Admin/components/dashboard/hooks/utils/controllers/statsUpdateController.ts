
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
    
    // Reset all state to ensure we start fresh
    setProcessedChannels([]);
    setErrors([]);
    
    // Reset progress state
    progressManager.updateProgress({
      isActive: true,
      progress: 0,
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      currentChannel: null,
      totalCount: 0,
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
      
      // Set total channels
      setTotalChannels(count);
      
      progressManager.updateProgress({ 
        totalCount: count,
        processedCount: 0,
      });
      
      if (channels.length === 0) {
        toast.info("No channels found missing stats");
        progressManager.updateProgress({ isActive: false });
        processingRef.current = false;
        return;
      }

      toast.info(`Starting stats update for ${channels.length} channels with missing stats. This may take a while.`);
      
      // Process channels sequentially with error handling for each
      const batchSize = 1; // Process one at a time
      const newErrors: string[] = [];
      let processedCount = 0;

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
          console.log(`Processing channel ${processedCount + 1}/${count}: ${channelTitle}`);
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
            
            // Increment processed count
            processedCount++;
            
            // Add to processed channels list to enable resuming
            setProcessedChannels(prev => [...prev, channel.id]);
          } catch (error) {
            // Catch any unexpected errors
            console.error(`Exception when processing ${channelTitle}:`, error);
            progressManager.incrementError();
            const errorMessage = `Channel ${channelTitle}: ${error instanceof Error ? error.message : String(error)}`;
            newErrors.push(errorMessage);
            progressManager.addError(errorMessage);
            
            // Increment processed count even for errors
            processedCount++;
            
            // Still add to processed to avoid getting stuck
            setProcessedChannels(prev => [...prev, channel.id]);
          }
          
          // Update processed count
          progressManager.updateProgress({ processedCount });
          
          // Calculate and update progress
          const newProgress = Math.floor((processedCount / count) * 100);
          progressManager.updateProgress({ progress: newProgress });
          
          // Show periodic progress updates (reduced frequency to avoid toast flooding)
          if ((processedCount % 10 === 0) || processedCount === count) {
            toast.info(`Progress: ${processedCount}/${count} channels processed`);
          }
          
          // Delay between each channel to avoid API rate limits
          if (!signal.aborted && (i + batch.indexOf(channel) + 1 < channels.length)) {
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
      progressManager.updateProgress({ isActive: false });
      processingRef.current = false;
      progressManager.setCurrentChannel(null);
      abortControllerRef.current = null;
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

  return {
    startMassUpdate,
    cancelUpdate,
    errors,
    totalChannels,
    processedChannels: processedChannels.length,
    state: progressManager.state
  };
};
