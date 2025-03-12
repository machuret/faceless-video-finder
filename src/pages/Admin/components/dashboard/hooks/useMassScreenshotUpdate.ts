
import { useState, useCallback } from "react";
import { initiateScreenshotUpdate } from "./utils/controllers/screenshotUpdateController";
import type { ScreenshotUpdateState } from "./utils/controllers/screenshotUpdateController";

export const useMassScreenshotUpdate = () => {
  const [state, setState] = useState<ScreenshotUpdateState>({
    isProcessing: false,
    progress: 0,
    currentChannel: null,
    processedChannels: 0,
    totalChannels: 0,
    errors: [],
    successCount: 0,
    errorCount: 0,
    updatedChannels: []
  });
  
  const startMassUpdate = useCallback(async () => {
    // Reset the state before starting
    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      currentChannel: null,
      processedChannels: 0,
      totalChannels: 0,
      errors: [],
      successCount: 0,
      errorCount: 0,
      updatedChannels: []
    }));
    
    const newState = await initiateScreenshotUpdate({
      onUpdateProgress: (processed, total, currentChannel) => {
        setState(prev => ({
          ...prev,
          processedChannels: processed,
          totalChannels: total,
          currentChannel,
          progress: Math.floor((processed / total) * 100)
        }));
      },
      onUpdateResult: (success) => {
        setState(prev => ({
          ...prev,
          successCount: success ? prev.successCount + 1 : prev.successCount,
          errorCount: !success ? prev.errorCount + 1 : prev.errorCount
        }));
      }
    });
    
    setState(newState);
  }, []);
  
  const cancelUpdate = useCallback(() => {
    setState(prev => ({
      ...prev,
      isProcessing: false
    }));
  }, []);
  
  return {
    startMassUpdate,
    cancelUpdate,
    isProcessing: state.isProcessing,
    progress: state.progress,
    currentChannel: state.currentChannel,
    processedChannels: state.processedChannels,
    totalChannels: state.totalChannels,
    errors: state.errors,
    successCount: state.successCount,
    errorCount: state.errorCount,
    updatedChannels: state.updatedChannels
  };
};
