
import { useState, useCallback } from "react";
import { useBulkStatsFetcher } from "../components/hooks/useBulkStatsFetcher";
import { useBulkTypeGenerator } from "../components/hooks/useBulkTypeGenerator";
import { useBulkKeywordsGenerator } from "../components/hooks/useBulkKeywordsGenerator";
import { useBulkScreenshotGenerator } from "../components/hooks/useBulkScreenshotGenerator";

type BulkOperationType = 'stats' | 'type' | 'keywords' | 'screenshot' | null;

export const useBulkOperations = (getSelectedChannels: () => any[]) => {
  // Bulk operation hooks
  const {
    fetchStatsForChannels,
    isProcessing: isStatsProcessing,
    progress: statsProgress,
    currentChannel: statsCurrentChannel,
    successCount: statsSuccessCount,
    errorCount: statsErrorCount,
    totalCount: statsTotalCount
  } = useBulkStatsFetcher();
  
  const {
    generateTypesForChannels,
    isProcessing: isTypeProcessing,
    progress: typeProgress,
    currentChannel: typeCurrentChannel,
    successCount: typeSuccessCount,
    errorCount: typeErrorCount,
    totalCount: typeTotalCount
  } = useBulkTypeGenerator();
  
  const {
    generateKeywordsForChannels,
    isProcessing: isKeywordsProcessing,
    progress: keywordsProgress,
    currentChannel: keywordsCurrentChannel,
    successCount: keywordsSuccessCount,
    errorCount: keywordsErrorCount,
    totalCount: keywordsTotalCount
  } = useBulkKeywordsGenerator();
  
  const {
    generateScreenshotsForChannels,
    isProcessing: isScreenshotProcessing,
    progress: screenshotProgress,
    currentChannel: screenshotCurrentChannel,
    successCount: screenshotSuccessCount,
    errorCount: screenshotErrorCount,
    totalCount: screenshotTotalCount
  } = useBulkScreenshotGenerator();

  const handleBulkFetchStats = useCallback(async () => {
    const selectedChannels = getSelectedChannels();
    await fetchStatsForChannels(selectedChannels);
  }, [fetchStatsForChannels, getSelectedChannels]);
  
  const handleBulkGenerateTypes = useCallback(async () => {
    const selectedChannels = getSelectedChannels();
    await generateTypesForChannels(selectedChannels);
  }, [generateTypesForChannels, getSelectedChannels]);
  
  const handleBulkGenerateKeywords = useCallback(async () => {
    const selectedChannels = getSelectedChannels();
    await generateKeywordsForChannels(selectedChannels);
  }, [generateKeywordsForChannels, getSelectedChannels]);
  
  const handleBulkTakeScreenshots = useCallback(async () => {
    const selectedChannels = getSelectedChannels();
    await generateScreenshotsForChannels(selectedChannels);
  }, [generateScreenshotsForChannels, getSelectedChannels]);

  return {
    // Bulk operations handlers
    handleBulkFetchStats,
    handleBulkGenerateTypes,
    handleBulkGenerateKeywords,
    handleBulkTakeScreenshots,
    
    // Status for various operations
    isStatsProcessing,
    isTypeProcessing,
    isKeywordsProcessing,
    isScreenshotProcessing,
    
    // Progress data
    statsProgress,
    typeProgress,
    keywordsProgress,
    screenshotProgress,
    
    // Current channel being processed
    statsCurrentChannel,
    typeCurrentChannel,
    keywordsCurrentChannel,
    screenshotCurrentChannel,
    
    // Success/error counts
    statsSuccessCount,
    typeSuccessCount,
    keywordsSuccessCount,
    screenshotSuccessCount,
    statsErrorCount,
    typeErrorCount,
    keywordsErrorCount,
    screenshotErrorCount,
    
    // Total counts
    statsTotalCount,
    typeTotalCount,
    keywordsTotalCount,
    screenshotTotalCount,
  };
};
