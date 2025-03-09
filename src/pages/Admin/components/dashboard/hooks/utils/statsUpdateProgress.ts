
import { useState } from "react";

export interface ProgressState {
  isProcessing: boolean;
  progress: number;
  totalChannels: number;
  processedChannels: number;
  successCount: number;
  errorCount: number;
  currentChannel: string | null;
  errors: string[];
}

export const createInitialProgressState = (): ProgressState => {
  return {
    isProcessing: false,
    progress: 0,
    totalChannels: 0,
    processedChannels: 0,
    successCount: 0,
    errorCount: 0,
    currentChannel: null,
    errors: []
  };
};

export const useProgressState = () => {
  const [state, setState] = useState<ProgressState>(createInitialProgressState());

  const resetProgress = () => {
    setState(createInitialProgressState());
  };

  const updateProgress = (updates: Partial<ProgressState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const incrementSuccess = () => {
    setState(prev => ({ 
      ...prev, 
      successCount: prev.successCount + 1 
    }));
  };

  const incrementError = () => {
    setState(prev => ({ 
      ...prev, 
      errorCount: prev.errorCount + 1 
    }));
  };

  const addError = (error: string) => {
    setState(prev => ({ 
      ...prev, 
      errors: [...prev.errors, error] 
    }));
  };

  const updateProcessedCount = (newProcessedCount: number) => {
    setState(prev => {
      const newProgress = Math.floor((newProcessedCount / prev.totalChannels) * 100);
      return {
        ...prev,
        processedChannels: newProcessedCount,
        progress: newProgress
      };
    });
  };

  const setCurrentChannel = (channelTitle: string | null) => {
    setState(prev => ({ ...prev, currentChannel: channelTitle }));
  };

  return {
    state,
    resetProgress,
    updateProgress,
    incrementSuccess,
    incrementError,
    addError,
    updateProcessedCount,
    setCurrentChannel
  };
};
