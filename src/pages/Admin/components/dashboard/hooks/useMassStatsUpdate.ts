
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { statsUpdateProcessor } from "./utils/statsUpdateProcessor";
import { useStatsUpdateProgress } from "./utils/statsUpdateProgress";

export const useMassStatsUpdate = () => {
  const {
    isProcessing,
    progressState,
    initializeProgress,
    updateProgress,
    updateCurrentChannel,
    incrementSuccessCount,
    incrementErrorCount,
    finishProcessing,
    saveProgressToStorage,
    loadProgressFromStorage,
    clearStoredProgress
  } = useStatsUpdateProgress();

  const [processingPaused, setProcessingPaused] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Load any saved progress from storage when component mounts
  useEffect(() => {
    const savedProgress = loadProgressFromStorage();
    if (savedProgress && savedProgress.isActive) {
      toast.info("Resuming previous stats update session");
    }
  }, [loadProgressFromStorage]);
  
  const updateChannelStats = useCallback(async (count: number) => {
    if (isProcessing) {
      toast.error("A stats update is already in progress");
      return;
    }
    
    // Check if we have saved progress
    const savedProgress = loadProgressFromStorage();
    const resuming = savedProgress && savedProgress.isActive;
    
    // If resuming, use saved state
    let channelsToUpdate = count;
    let processedChannels: string[] = [];
    let startIndex = 0;
    
    if (resuming) {
      channelsToUpdate = savedProgress.totalCount;
      processedChannels = savedProgress.processedChannels || [];
      startIndex = processedChannels.length;
      
      // Confirm with user if they want to resume
      if (!confirm(`Resume previous update? ${processedChannels.length} out of ${channelsToUpdate} channels were already processed.`)) {
        clearStoredProgress();
        processedChannels = [];
        startIndex = 0;
      } else {
        // Initialize progress with saved data
        initializeProgress(
          channelsToUpdate,
          savedProgress.processedCount,
          savedProgress.successCount,
          savedProgress.errorCount,
          processedChannels
        );
        toast.info(`Resuming stats update: ${savedProgress.processedCount} of ${channelsToUpdate} channels already processed`);
      }
    } else {
      // Initialize new progress
      initializeProgress(channelsToUpdate);
      toast.info(`Starting stats update for ${channelsToUpdate} channels. This may take a while.`);
    }
    
    setProcessingPaused(false);
    setProcessingComplete(false);
    
    try {
      // Process channels in batches
      for (let i = startIndex; i < channelsToUpdate; i++) {
        // Check if processing was paused
        if (processingPaused) {
          saveProgressToStorage();
          toast.info("Stats update paused. You can resume later.");
          return;
        }
        
        // Update UI
        updateProgress(i, channelsToUpdate);
        
        const result = await statsUpdateProcessor(i, processedChannels);
        updateCurrentChannel(result.channelTitle || `Channel #${i + 1}`);
        
        // Record processed channel ID
        if (!processedChannels.includes(result.channelId)) {
          processedChannels.push(result.channelId);
        }
        
        if (result.success) {
          incrementSuccessCount();
        } else {
          incrementErrorCount();
        }
        
        // Save progress to storage periodically
        if (i % 5 === 0 || i === channelsToUpdate - 1) {
          saveProgressToStorage(processedChannels);
        }
        
        // Add a small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setProcessingComplete(true);
      
      // Show completion toast
      if (progressState.successCount > 0) {
        if (progressState.errorCount === 0) {
          toast.success(`Stats update completed successfully for all ${progressState.successCount} channels!`);
        } else {
          toast.warning(
            `Stats update completed: ${progressState.successCount} successful, ${progressState.errorCount} failed.`
          );
        }
      } else {
        toast.error("Stats update failed for all channels.");
      }
      
      // Clear progress from storage since we're done
      clearStoredProgress();
    } catch (error) {
      console.error("Error in mass stats update:", error);
      toast.error(`Stats update encountered an error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Save progress so user can resume
      saveProgressToStorage(processedChannels);
    } finally {
      finishProcessing();
    }
  }, [
    isProcessing,
    progressState.successCount,
    progressState.errorCount,
    processingPaused,
    initializeProgress,
    updateProgress,
    updateCurrentChannel,
    incrementSuccessCount,
    incrementErrorCount,
    finishProcessing,
    saveProgressToStorage,
    loadProgressFromStorage,
    clearStoredProgress
  ]);
  
  const pauseProcessing = useCallback(() => {
    setProcessingPaused(true);
    toast.info("Pausing stats update after current operation completes...");
  }, []);
  
  const resumeProcessing = useCallback(() => {
    const savedProgress = loadProgressFromStorage();
    if (savedProgress && savedProgress.isActive) {
      updateChannelStats(savedProgress.totalCount);
    } else {
      toast.error("No paused stats update found");
    }
  }, [loadProgressFromStorage, updateChannelStats]);
  
  return {
    updateChannelStats,
    pauseProcessing,
    resumeProcessing,
    isProcessing,
    processingPaused,
    processingComplete,
    progress: progressState.progress,
    currentChannel: progressState.currentChannel,
    processedCount: progressState.processedCount,
    totalCount: progressState.totalCount,
    errorCount: progressState.errorCount,
    successCount: progressState.successCount
  };
};
