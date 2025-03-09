
import { useState, useCallback } from "react";

// Local storage key for saving progress
const STATS_UPDATE_PROGRESS_KEY = "mass_stats_update_progress";

export interface ProgressState {
  progress: number;
  currentChannel: string | null;
  processedCount: number;
  totalCount: number;
  errorCount: number;
  successCount: number;
  processedChannels: string[];
  isActive: boolean;
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
    isActive: false
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
    setState(prev => ({ ...prev, processedChannels: count }));
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

export const useStatsUpdateProgress = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState<ProgressState>({
    progress: 0,
    currentChannel: null,
    processedCount: 0,
    totalCount: 0,
    errorCount: 0,
    successCount: 0,
    processedChannels: [],
    isActive: false
  });
  
  // Initialize progress tracking
  const initializeProgress = useCallback((
    totalCount: number, 
    processedCount: number = 0,
    successCount: number = 0,
    errorCount: number = 0,
    processedChannels: string[] = []
  ) => {
    setIsProcessing(true);
    setProgressState({
      progress: processedCount > 0 ? Math.floor((processedCount / totalCount) * 100) : 0,
      currentChannel: null,
      processedCount,
      totalCount,
      errorCount,
      successCount,
      processedChannels,
      isActive: true
    });
  }, []);
  
  // Update progress
  const updateProgress = useCallback((currentIndex: number, totalCount: number) => {
    setProgressState(prev => ({
      ...prev,
      progress: Math.floor(((currentIndex + 1) / totalCount) * 100),
      processedCount: currentIndex + 1,
    }));
  }, []);
  
  // Update current channel
  const updateCurrentChannel = useCallback((channelName: string) => {
    setProgressState(prev => ({
      ...prev,
      currentChannel: channelName
    }));
  }, []);
  
  // Increment success count
  const incrementSuccessCount = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      successCount: prev.successCount + 1
    }));
  }, []);
  
  // Increment error count
  const incrementErrorCount = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));
  }, []);
  
  // Finish processing
  const finishProcessing = useCallback(() => {
    setIsProcessing(false);
    setProgressState(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);
  
  // Save progress to local storage
  const saveProgressToStorage = useCallback((processedChannels?: string[]) => {
    setProgressState(prev => {
      const updatedState = {
        ...prev,
        processedChannels: processedChannels || prev.processedChannels,
        isActive: true
      };
      
      try {
        localStorage.setItem(STATS_UPDATE_PROGRESS_KEY, JSON.stringify(updatedState));
      } catch (error) {
        console.error("Error saving progress to local storage:", error);
      }
      
      return updatedState;
    });
  }, []);
  
  // Load progress from local storage
  const loadProgressFromStorage = useCallback(() => {
    try {
      const savedProgress = localStorage.getItem(STATS_UPDATE_PROGRESS_KEY);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress) as ProgressState;
        return parsedProgress;
      }
    } catch (error) {
      console.error("Error loading progress from local storage:", error);
    }
    return null;
  }, []);
  
  // Clear stored progress
  const clearStoredProgress = useCallback(() => {
    try {
      localStorage.removeItem(STATS_UPDATE_PROGRESS_KEY);
    } catch (error) {
      console.error("Error clearing progress from local storage:", error);
    }
  }, []);
  
  return {
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
  };
};
