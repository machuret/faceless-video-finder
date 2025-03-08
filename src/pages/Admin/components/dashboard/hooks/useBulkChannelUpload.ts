
import { toast } from "sonner";
import { parseChannelUrls, validateUrlsCount } from "./utils/urlUtils";
import { useBulkUploadState } from "./useBulkUploadState";
import { useChannelProcessor } from "./useChannelProcessor";
import { useState } from "react";

export interface UploadResult {
  url: string;
  channelTitle: string;
  success: boolean;
  message: string;
  isNew: boolean;
}

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
  
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
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
    
    // Reset upload results
    setUploadResults([]);
    
    initializeProgress(urlsToProcess.length);
    toast.info(`Starting bulk upload of ${urlsToProcess.length} channels. This may take a while.`);
    console.log(`Processing ${urlsToProcess.length} URLs:`, urlsToProcess);
    
    // Process each URL individually with proper sequential processing
    try {
      const results: UploadResult[] = [];
      
      for (let i = 0; i < urlsToProcess.length; i++) {
        const url = urlsToProcess[i];
        updateCurrentChannel(url);
        console.log(`Processing URL ${i + 1}/${urlsToProcess.length}: ${url}`);
        
        // Process one URL at a time and wait for it to complete
        const result = await processChannelUrl(url, i, urlsToProcess.length);
        
        if (result.success) {
          incrementSuccessCount();
        } else {
          incrementErrorCount();
        }
        
        results.push(result);
        updateProgress(i + 1, urlsToProcess.length);
        
        // Add a delay between requests to avoid overwhelming the API
        if (i < urlsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      setUploadResults(results);
    } catch (error) {
      console.error("Error in bulk processing:", error);
      toast.error("An error occurred during bulk processing");
    } finally {
      finishProcessing();
    }
  };

  return {
    isProcessing,
    progress: progressState.progress,
    currentChannel: progressState.currentChannel,
    processedCount: progressState.processedCount,
    totalCount: progressState.totalCount,
    errorCount: progressState.errorCount,
    successCount: progressState.successCount,
    uploadResults,
    processChannelUrls
  };
};
