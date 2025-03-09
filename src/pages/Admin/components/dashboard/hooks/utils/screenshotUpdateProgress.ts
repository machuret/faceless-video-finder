
import { useState, useCallback } from "react";

export interface ProgressState {
  progress: number;
  currentChannel: string | null;
  processedCount: number;
  totalCount: number;
  errorCount: number;
  successCount: number;
  processedChannels: string[];
  isActive: boolean;
  errors?: string[];
}

export const createInitialProgressState = (): ProgressState => {
  return {
    progress: 0,
    currentChannel: null,
    processedCount: 0,
    totalCount: 0,
    errorCount: 0,
    successCount: 0,
    processedChannels: [],
    isActive: false,
    errors: []
  };
};

export const useProgressState = () => {
  // Internal state implementation
  const [state, setState] = useState<ProgressState>(createInitialProgressState());
  
  // Update progress with partial state
  const updateProgress = useCallback((partialState: Partial<ProgressState>) => {
    setState(prev => ({ ...prev, ...partialState }));
  }, []);
  
  // Reset to initial state
  const resetProgress = useCallback(() => {
    setState(createInitialProgressState());
  }, []);
  
  // Increment success counter
  const incrementSuccess = useCallback(() => {
    setState(prev => ({ ...prev, successCount: prev.successCount + 1 }));
  }, []);
  
  // Increment error counter
  const incrementError = useCallback(() => {
    setState(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
  }, []);
  
  // Add error message to list
  const addError = useCallback((errorMessage: string) => {
    setState(prev => ({ 
      ...prev, 
      errors: [...(prev.errors || []), errorMessage]
    }));
  }, []);
  
  // Update processed count
  const updateProcessedCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, processedCount: count }));
  }, []);
  
  // Set current channel
  const setCurrentChannel = useCallback((channel: string | null) => {
    setState(prev => ({ ...prev, currentChannel: channel }));
  }, []);
  
  return {
    state,
    updateProgress,
    resetProgress,
    incrementSuccess,
    incrementError,
    addError,
    updateProcessedCount,
    setCurrentChannel
  };
};
