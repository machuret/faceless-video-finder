
import React, { createContext, useContext, useState } from "react";

export type BulkOperationType = 'stats' | 'type' | 'keywords' | 'screenshot' | null;

interface BulkOperationsContextType {
  currentOperation: BulkOperationType;
  setCurrentOperation: (type: BulkOperationType) => void;
  showBulkDialog: boolean;
  setShowBulkDialog: (show: boolean) => void;
  handleBulkDialogDone: () => void;
  closeBulkDialog: () => void;
  isAnyProcessing: boolean;
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

interface BulkOperationsProviderProps {
  children: React.ReactNode;
  fetchChannels: (offset?: number, pageSize?: number) => void;
  currentPage: number;
  pageSize: number;
  clearSelection: () => void;
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

  const isAnyProcessing = isStatsProcessing || isTypeProcessing || isKeywordsProcessing || isScreenshotProcessing;
  
  const getCurrentProgress = () => {
    switch (currentOperation) {
      case 'stats': return statsProgress;
      case 'type': return typeProgress;
      case 'keywords': return keywordsProgress;
      case 'screenshot': return screenshotProgress;
      default: return 0;
    }
  };
  
  const getCurrentChannel = () => {
    switch (currentOperation) {
      case 'stats': return statsCurrentChannel;
      case 'type': return typeCurrentChannel;
      case 'keywords': return keywordsCurrentChannel;
      case 'screenshot': return screenshotCurrentChannel;
      default: return null;
    }
  };
  
  const getSuccessCount = () => {
    switch (currentOperation) {
      case 'stats': return statsSuccessCount;
      case 'type': return typeSuccessCount;
      case 'keywords': return keywordsSuccessCount;
      case 'screenshot': return screenshotSuccessCount;
      default: return 0;
    }
  };
  
  const getErrorCount = () => {
    switch (currentOperation) {
      case 'stats': return statsErrorCount;
      case 'type': return typeErrorCount;
      case 'keywords': return keywordsErrorCount;
      case 'screenshot': return screenshotErrorCount;
      default: return 0;
    }
  };
  
  const getTotalCount = () => {
    switch (currentOperation) {
      case 'stats': return statsTotalCount;
      case 'type': return typeTotalCount;
      case 'keywords': return keywordsTotalCount;
      case 'screenshot': return screenshotTotalCount;
      default: return 0;
    }
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

  const value = {
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
  };

  return (
    <BulkOperationsContext.Provider value={value}>
      {children}
    </BulkOperationsContext.Provider>
  );
};
