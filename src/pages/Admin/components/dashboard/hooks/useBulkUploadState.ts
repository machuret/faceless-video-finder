
import { useState } from "react";
import { toast } from "sonner";
import { ProgressState, createInitialProgressState, calculateProgress } from "./utils/progressUtils";

export const useBulkUploadState = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState<ProgressState>(createInitialProgressState());
  
  const initializeProgress = (urlsCount: number) => {
    setProgressState({
      totalCount: urlsCount,
      processedCount: 0,
      progress: 0,
      currentChannel: "",
      errorCount: 0,
      successCount: 0
    });
    setIsProcessing(true);
  };

  const updateProgress = (processed: number, total: number) => {
    setProgressState(prevState => ({
      ...prevState,
      processedCount: processed,
      progress: calculateProgress(processed, total)
    }));
  };
  
  const updateCurrentChannel = (url: string) => {
    setProgressState(prevState => ({
      ...prevState,
      currentChannel: url
    }));
  };
  
  const incrementSuccessCount = () => {
    setProgressState(prevState => ({
      ...prevState,
      successCount: prevState.successCount + 1
    }));
  };
  
  const incrementErrorCount = () => {
    setProgressState(prevState => ({
      ...prevState,
      errorCount: prevState.errorCount + 1
    }));
  };
  
  const finishProcessing = () => {
    setIsProcessing(false);
    
    // Show final results toast
    const { totalCount, successCount, errorCount } = progressState;
    const summaryMessage = `Completed processing ${totalCount} channels: ${successCount} successful, ${errorCount} failed`;
    
    if (errorCount > 0) {
      toast.warning(summaryMessage);
    } else {
      toast.success(summaryMessage);
    }
  };
  
  return {
    isProcessing,
    progressState,
    initializeProgress,
    updateProgress,
    updateCurrentChannel,
    incrementSuccessCount,
    incrementErrorCount,
    finishProcessing
  };
};
