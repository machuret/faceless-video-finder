
import { useState, useCallback } from "react";
import { initiateScreenshotUpdate } from "./controllers/screenshotUpdateController";
import type { ScreenshotUpdateState } from "./controllers/screenshotUpdateController";

// This is the main processor hook that applications can use
export const useScreenshotUpdateProcessor = () => {
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
    // Reset state before starting
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
    
    try {
      const newState = await initiateScreenshotUpdate({
        onUpdateProgress: (processed, total, currentChannel) => {
          setState(prev => ({
            ...prev,
            processedChannels: processed,
            totalChannels: total,
            currentChannel,
            progress: total > 0 ? Math.floor((processed / total) * 100) : 0
          }));
        },
        onUpdateResult: (success, channelTitle) => {
          setState(prev => ({
            ...prev,
            successCount: success ? prev.successCount + 1 : prev.successCount,
            errorCount: !success ? prev.errorCount + 1 : prev.errorCount,
            updatedChannels: success && channelTitle ? [...prev.updatedChannels, channelTitle] : prev.updatedChannels
          }));
        }
      });
      
      setState(prev => ({
        ...prev,
        ...newState
      }));
    } catch (error) {
      console.error("Error in screenshot update process:", error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        errors: [...prev.errors, `Update process failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }));
    }
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
