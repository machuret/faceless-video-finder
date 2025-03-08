
import { toast } from "sonner";
import { parseChannelUrls, validateUrlsCount } from "./utils/urlUtils";
import { useBulkUploadState } from "./useBulkUploadState";
import { useChannelProcessor } from "./useChannelProcessor";

export const useBulkChannelUpload = () => {
  const {
    isProcessing,
    progressState,
    initializeProgress,
    updateProgress,
    updateCurrentChannel,
    incrementSuccessCount,
    incrementErrorCount,
    finishProcessing
  } = useBulkUploadState();
  
  const { processChannelUrl } = useChannelProcessor();
  
  /**
   * Process multiple channel URLs
   */
  const processChannelUrls = async (urls: string) => {
    // Parse URLs, one per line
    const channelUrls = parseChannelUrls(urls);
    const urlsToProcess = validateUrlsCount(channelUrls);
    
    if (urlsToProcess.length === 0) {
      toast.error("Please enter at least one YouTube channel URL");
      return;
    }
    
    initializeProgress(urlsToProcess.length);
    toast.info(`Starting bulk upload of ${urlsToProcess.length} channels. This may take a while.`);
    
    // Process each URL individually
    for (let i = 0; i < urlsToProcess.length; i++) {
      const url = urlsToProcess[i];
      updateCurrentChannel(url);
      
      const success = await processChannelUrl(url, i, urlsToProcess.length);
      
      if (success) {
        incrementSuccessCount();
      } else {
        incrementErrorCount();
      }
      
      updateProgress(i + 1, urlsToProcess.length);
      
      // Add a small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    finishProcessing();
  };

  return {
    isProcessing,
    progress: progressState.progress,
    currentChannel: progressState.currentChannel,
    processedCount: progressState.processedCount,
    totalCount: progressState.totalCount,
    errorCount: progressState.errorCount,
    successCount: progressState.successCount,
    processChannelUrls
  };
};
