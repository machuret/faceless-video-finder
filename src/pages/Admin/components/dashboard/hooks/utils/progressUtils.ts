
/**
 * Utility functions for tracking and updating progress during bulk operations
 */

/**
 * Calculate progress percentage
 */
export const calculateProgress = (processed: number, total: number): number => {
  return Math.floor((processed / total) * 100);
};

/**
 * Interface for progress state
 */
export interface ProgressState {
  processedCount: number;
  totalCount: number;
  progress: number;
  currentChannel: string;
  errorCount: number;
  successCount: number;
}

/**
 * Create initial progress state
 */
export const createInitialProgressState = (): ProgressState => {
  return {
    processedCount: 0,
    totalCount: 0,
    progress: 0,
    currentChannel: "",
    errorCount: 0,
    successCount: 0
  };
};
