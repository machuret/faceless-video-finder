
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useStatsUpdateProcessor } from "./utils/statsUpdateProcessor";
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

  const {
    startMassUpdate,
    cancelUpdate,
    errors,
    totalChannels,
    processedChannels,
    state
  } = useStatsUpdateProcessor();

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
    await startMassUpdate();
  }, [startMassUpdate]);
  
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
    isProcessing: state.isActive,
    processingPaused,
    processingComplete,
    progress: state.progress,
    currentChannel: state.currentChannel,
    processedCount: state.processedCount,
    totalCount: state.totalCount,
    errorCount: state.errorCount,
    successCount: state.successCount,
    startMassUpdate,
    cancelUpdate,
    errors,
    totalChannels,
    processedChannels
  };
};
