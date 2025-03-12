
import React, { createContext, useContext, useState, useMemo } from "react";
import { Channel } from "@/types/youtube";

export type BulkOperationType = 'stats' | 'type' | 'keywords' | 'screenshot' | null;

// Progress state interface
interface OperationProgress {
  progress: number;
  currentChannel: string | null;
  successCount: number;
  errorCount: number;
  totalCount: number;
}

// State shape
interface BulkOperationsState {
  currentOperation: BulkOperationType;
  showBulkDialog: boolean;
  operationProgress: {
    stats: OperationProgress;
    type: OperationProgress;
    keywords: OperationProgress;
    screenshot: OperationProgress;
  };
}

// Context value type
interface BulkOperationsContextType {
  // Main state access selectors
  currentOperation: BulkOperationType;
  showBulkDialog: boolean;
  isAnyProcessing: boolean;
  
  // Action methods
  setCurrentOperation: (type: BulkOperationType) => void;
  setShowBulkDialog: (show: boolean) => void;
  handleBulkDialogDone: () => void;
  closeBulkDialog: () => void;
  
  // Selectors
  getCurrentProgress: () => number;
  getCurrentChannel: () => string | null;
  getSuccessCount: () => number;
  getErrorCount: () => number;
  getTotalCount: () => number;
}

const BulkOperationsContext = createContext<BulkOperationsContextType | undefined>(undefined);

export const useBulkOperations = () => {
  const context = useContext(BulkOperationsContext);
  if (!context) {
    throw new Error("useBulkOperations must be used within a BulkOperationsProvider");
  }
  return context;
};

// Default progress state
const defaultProgressState: OperationProgress = {
  progress: 0,
  currentChannel: null,
  successCount: 0,
  errorCount: 0,
  totalCount: 0
};

interface BulkOperationsProviderProps {
  children: React.ReactNode;
  fetchChannels: (offset?: number, pageSize?: number) => void;
  currentPage: number;
  pageSize: number;
  clearSelection: () => void;
  // Separate props by operation type to avoid excessive re-renders
  isStatsProcessing: boolean;
  isTypeProcessing: boolean;
  isKeywordsProcessing: boolean;
  isScreenshotProcessing: boolean;
  statsProgress: number;
  typeProgress: number;
  keywordsProgress: number;
  screenshotProgress: number;
  statsCurrentChannel: string | null;
  typeCurrentChannel: string | null;
  keywordsCurrentChannel: string | null;
  screenshotCurrentChannel: string | null;
  statsSuccessCount: number;
  typeSuccessCount: number;
  keywordsSuccessCount: number;
  screenshotSuccessCount: number;
  statsErrorCount: number;
  typeErrorCount: number;
  keywordsErrorCount: number;
  screenshotErrorCount: number;
  statsTotalCount: number;
  typeTotalCount: number;
  keywordsTotalCount: number;
  screenshotTotalCount: number;
}

export const BulkOperationsProvider: React.FC<BulkOperationsProviderProps> = ({ 
  children,
  fetchChannels,
  currentPage,
  pageSize,
  clearSelection,
  isStatsProcessing,
  isTypeProcessing,
  isKeywordsProcessing,
  isScreenshotProcessing,
  statsProgress,
  typeProgress,
  keywordsProgress,
  screenshotProgress,
  statsCurrentChannel,
  typeCurrentChannel,
  keywordsCurrentChannel,
  screenshotCurrentChannel,
  statsSuccessCount,
  typeSuccessCount,
  keywordsSuccessCount,
  screenshotSuccessCount,
  statsErrorCount,
  typeErrorCount,
  keywordsErrorCount,
  screenshotErrorCount,
  statsTotalCount,
  typeTotalCount,
  keywordsTotalCount,
  screenshotTotalCount,
}) => {
  const [currentOperation, setCurrentOperation] = useState<BulkOperationType>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Derive progress state from props
  const operationProgress = useMemo(() => ({
    stats: {
      progress: statsProgress,
      currentChannel: statsCurrentChannel,
      successCount: statsSuccessCount,
      errorCount: statsErrorCount,
      totalCount: statsTotalCount
    },
    type: {
      progress: typeProgress,
      currentChannel: typeCurrentChannel,
      successCount: typeSuccessCount,
      errorCount: typeErrorCount,
      totalCount: typeTotalCount
    },
    keywords: {
      progress: keywordsProgress,
      currentChannel: keywordsCurrentChannel,
      successCount: keywordsSuccessCount,
      errorCount: keywordsErrorCount,
      totalCount: keywordsTotalCount
    },
    screenshot: {
      progress: screenshotProgress,
      currentChannel: screenshotCurrentChannel,
      successCount: screenshotSuccessCount,
      errorCount: screenshotErrorCount,
      totalCount: screenshotTotalCount
    }
  }), [
    statsProgress, statsCurrentChannel, statsSuccessCount, statsErrorCount, statsTotalCount,
    typeProgress, typeCurrentChannel, typeSuccessCount, typeErrorCount, typeTotalCount,
    keywordsProgress, keywordsCurrentChannel, keywordsSuccessCount, keywordsErrorCount, keywordsTotalCount,
    screenshotProgress, screenshotCurrentChannel, screenshotSuccessCount, screenshotErrorCount, screenshotTotalCount
  ]);

  // Compute derived state
  const isAnyProcessing = isStatsProcessing || isTypeProcessing || isKeywordsProcessing || isScreenshotProcessing;
  
  // Selector methods
  const getCurrentProgress = () => {
    if (!currentOperation) return 0;
    return operationProgress[currentOperation].progress;
  };
  
  const getCurrentChannel = () => {
    if (!currentOperation) return null;
    return operationProgress[currentOperation].currentChannel;
  };
  
  const getSuccessCount = () => {
    if (!currentOperation) return 0;
    return operationProgress[currentOperation].successCount;
  };
  
  const getErrorCount = () => {
    if (!currentOperation) return 0;
    return operationProgress[currentOperation].errorCount;
  };
  
  const getTotalCount = () => {
    if (!currentOperation) return 0;
    return operationProgress[currentOperation].totalCount;
  };

  const closeBulkDialog = () => {
    if (!isAnyProcessing) {
      setShowBulkDialog(false);
      setCurrentOperation(null);
    }
  };

  const handleBulkDialogDone = () => {
    setShowBulkDialog(false);
    setCurrentOperation(null);
    clearSelection();
    fetchChannels((currentPage - 1) * pageSize, pageSize);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentOperation,
    setCurrentOperation,
    showBulkDialog,
    setShowBulkDialog,
    handleBulkDialogDone,
    closeBulkDialog,
    isAnyProcessing,
    getCurrentProgress,
    getCurrentChannel,
    getSuccessCount,
    getErrorCount,
    getTotalCount
  }), [
    currentOperation, 
    showBulkDialog, 
    isAnyProcessing, 
    operationProgress
  ]);

  return (
    <BulkOperationsContext.Provider value={value}>
      {children}
    </BulkOperationsContext.Provider>
  );
};
