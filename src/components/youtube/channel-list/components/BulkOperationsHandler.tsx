
import React, { useEffect } from "react";
import { useBulkOperations } from "../context/BulkOperationsContext";
import { useBulkStatsFetcher } from "./hooks/useBulkStatsFetcher";
import { useBulkTypeGenerator } from "./hooks/useBulkTypeGenerator";
import { useBulkKeywordsGenerator } from "./hooks/useBulkKeywordsGenerator";
import { useBulkScreenshotGenerator } from "./hooks/useBulkScreenshotGenerator";
import BulkOperationDialog from "./BulkOperationDialog";

interface BulkOperationsHandlerProps {
  getSelectedChannels: () => Array<{ id: string; url: string; title: string }>;
  onStatsProcessingChange?: (isProcessing: boolean) => void;
  onTypeProcessingChange?: (isProcessing: boolean) => void;
  onKeywordsProcessingChange?: (isProcessing: boolean) => void;
  onScreenshotProcessingChange?: (isProcessing: boolean) => void;
  onStatsProgressChange?: (progress: number) => void;
  onTypeProgressChange?: (progress: number) => void;
  onKeywordsProgressChange?: (progress: number) => void;
  onScreenshotProgressChange?: (progress: number) => void;
  onStatsCurrentChannelChange?: (channel: string | null) => void;
  onTypeCurrentChannelChange?: (channel: string | null) => void;
  onKeywordsCurrentChannelChange?: (channel: string | null) => void;
  onScreenshotCurrentChannelChange?: (channel: string | null) => void;
  onStatsSuccessCountChange?: (count: number) => void;
  onTypeSuccessCountChange?: (count: number) => void;
  onKeywordsSuccessCountChange?: (count: number) => void;
  onScreenshotSuccessCountChange?: (count: number) => void;
  onStatsErrorCountChange?: (count: number) => void;
  onTypeErrorCountChange?: (count: number) => void;
  onKeywordsErrorCountChange?: (count: number) => void;
  onScreenshotErrorCountChange?: (count: number) => void;
  onStatsTotalCountChange?: (count: number) => void;
  onTypeTotalCountChange?: (count: number) => void;
  onKeywordsTotalCountChange?: (count: number) => void;
  onScreenshotTotalCountChange?: (count: number) => void;
}

const BulkOperationsHandler: React.FC<BulkOperationsHandlerProps> = ({
  getSelectedChannels,
  onStatsProcessingChange,
  onTypeProcessingChange,
  onKeywordsProcessingChange,
  onScreenshotProcessingChange,
  onStatsProgressChange,
  onTypeProgressChange,
  onKeywordsProgressChange,
  onScreenshotProgressChange,
  onStatsCurrentChannelChange,
  onTypeCurrentChannelChange,
  onKeywordsCurrentChannelChange,
  onScreenshotCurrentChannelChange,
  onStatsSuccessCountChange,
  onTypeSuccessCountChange,
  onKeywordsSuccessCountChange,
  onScreenshotSuccessCountChange,
  onStatsErrorCountChange,
  onTypeErrorCountChange,
  onKeywordsErrorCountChange,
  onScreenshotErrorCountChange,
  onStatsTotalCountChange,
  onTypeTotalCountChange,
  onKeywordsTotalCountChange,
  onScreenshotTotalCountChange
}) => {
  const { 
    currentOperation,
    setCurrentOperation,
    showBulkDialog,
    setShowBulkDialog
  } = useBulkOperations();

  // Bulk operations hooks
  const {
    fetchStatsForChannels,
    isProcessing: isProcessingStats,
    progress: statsProgress,
    currentChannel: statsCurrentChannel,
    successCount: statsSuccessCount,
    errorCount: statsErrorCount,
    totalCount: statsTotalCount
  } = useBulkStatsFetcher();

  const {
    generateTypesForChannels,
    isProcessing: isProcessingTypes,
    progress: typeProgress,
    currentChannel: typeCurrentChannel,
    successCount: typeSuccessCount,
    errorCount: typeErrorCount,
    totalCount: typeTotalCount
  } = useBulkTypeGenerator();

  const {
    generateKeywordsForChannels,
    isProcessing: isProcessingKeywords,
    progress: keywordsProgress,
    currentChannel: keywordsCurrentChannel,
    successCount: keywordsSuccessCount,
    errorCount: keywordsErrorCount,
    totalCount: keywordsTotalCount
  } = useBulkKeywordsGenerator();

  const {
    generateScreenshotsForChannels,
    isProcessing: isProcessingScreenshots,
    progress: screenshotProgress,
    currentChannel: screenshotCurrentChannel,
    successCount: screenshotSuccessCount,
    errorCount: screenshotErrorCount,
    totalCount: screenshotTotalCount
  } = useBulkScreenshotGenerator();

  // Report changes to parent component
  useEffect(() => {
    onStatsProcessingChange?.(isProcessingStats);
  }, [isProcessingStats, onStatsProcessingChange]);

  useEffect(() => {
    onTypeProcessingChange?.(isProcessingTypes);
  }, [isProcessingTypes, onTypeProcessingChange]);

  useEffect(() => {
    onKeywordsProcessingChange?.(isProcessingKeywords);
  }, [isProcessingKeywords, onKeywordsProcessingChange]);

  useEffect(() => {
    onScreenshotProcessingChange?.(isProcessingScreenshots);
  }, [isProcessingScreenshots, onScreenshotProcessingChange]);

  useEffect(() => {
    onStatsProgressChange?.(statsProgress);
  }, [statsProgress, onStatsProgressChange]);

  useEffect(() => {
    onTypeProgressChange?.(typeProgress);
  }, [typeProgress, onTypeProgressChange]);

  useEffect(() => {
    onKeywordsProgressChange?.(keywordsProgress);
  }, [keywordsProgress, onKeywordsProgressChange]);

  useEffect(() => {
    onScreenshotProgressChange?.(screenshotProgress);
  }, [screenshotProgress, onScreenshotProgressChange]);

  useEffect(() => {
    onStatsCurrentChannelChange?.(statsCurrentChannel);
  }, [statsCurrentChannel, onStatsCurrentChannelChange]);

  useEffect(() => {
    onTypeCurrentChannelChange?.(typeCurrentChannel);
  }, [typeCurrentChannel, onTypeCurrentChannelChange]);

  useEffect(() => {
    onKeywordsCurrentChannelChange?.(keywordsCurrentChannel);
  }, [keywordsCurrentChannel, onKeywordsCurrentChannelChange]);

  useEffect(() => {
    onScreenshotCurrentChannelChange?.(screenshotCurrentChannel);
  }, [screenshotCurrentChannel, onScreenshotCurrentChannelChange]);

  useEffect(() => {
    onStatsSuccessCountChange?.(statsSuccessCount);
  }, [statsSuccessCount, onStatsSuccessCountChange]);

  useEffect(() => {
    onTypeSuccessCountChange?.(typeSuccessCount);
  }, [typeSuccessCount, onTypeSuccessCountChange]);

  useEffect(() => {
    onKeywordsSuccessCountChange?.(keywordsSuccessCount);
  }, [keywordsSuccessCount, onKeywordsSuccessCountChange]);

  useEffect(() => {
    onScreenshotSuccessCountChange?.(screenshotSuccessCount);
  }, [screenshotSuccessCount, onScreenshotSuccessCountChange]);

  useEffect(() => {
    onStatsErrorCountChange?.(statsErrorCount);
  }, [statsErrorCount, onStatsErrorCountChange]);

  useEffect(() => {
    onTypeErrorCountChange?.(typeErrorCount);
  }, [typeErrorCount, onTypeErrorCountChange]);

  useEffect(() => {
    onKeywordsErrorCountChange?.(keywordsErrorCount);
  }, [keywordsErrorCount, onKeywordsErrorCountChange]);

  useEffect(() => {
    onScreenshotErrorCountChange?.(screenshotErrorCount);
  }, [screenshotErrorCount, onScreenshotErrorCountChange]);

  useEffect(() => {
    onStatsTotalCountChange?.(statsTotalCount);
  }, [statsTotalCount, onStatsTotalCountChange]);

  useEffect(() => {
    onTypeTotalCountChange?.(typeTotalCount);
  }, [typeTotalCount, onTypeTotalCountChange]);

  useEffect(() => {
    onKeywordsTotalCountChange?.(keywordsTotalCount);
  }, [keywordsTotalCount, onKeywordsTotalCountChange]);

  useEffect(() => {
    onScreenshotTotalCountChange?.(screenshotTotalCount);
  }, [screenshotTotalCount, onScreenshotTotalCountChange]);

  // When the BulkActionsMenu triggers an operation
  useEffect(() => {
    if (!currentOperation) return;

    const selectedChannels = getSelectedChannels();
    
    if (selectedChannels.length === 0) {
      setCurrentOperation(null);
      return;
    }

    setShowBulkDialog(true);

    // Start the appropriate operation
    switch (currentOperation) {
      case 'stats':
        fetchStatsForChannels(selectedChannels);
        break;
      case 'type':
        generateTypesForChannels(selectedChannels);
        break;
      case 'keywords':
        generateKeywordsForChannels(selectedChannels);
        break;
      case 'screenshot':
        generateScreenshotsForChannels(selectedChannels);
        break;
    }
  }, [currentOperation, getSelectedChannels, setShowBulkDialog, setCurrentOperation, fetchStatsForChannels, generateTypesForChannels, generateKeywordsForChannels, generateScreenshotsForChannels]);

  return (
    <BulkOperationDialog />
  );
};

export default BulkOperationsHandler;
