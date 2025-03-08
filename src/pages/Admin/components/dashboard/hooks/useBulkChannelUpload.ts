
import { useState } from "react";
import { toast } from "sonner";
import { 
  fetchChannelData, 
  formatChannelData, 
  saveChannelToDatabase 
} from "../utils/channelDataUtils";

export const useBulkChannelUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const parseChannelUrls = (urls: string): string[] => {
    return urls
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);
  };

  const validateUrlsCount = (channelUrls: string[]): string[] => {
    if (channelUrls.length === 0) {
      toast.error("Please enter at least one YouTube channel URL");
      return [];
    }
    
    if (channelUrls.length > 10) {
      toast.warning("You can only upload up to 10 channels at once. Only the first 10 will be processed.");
      return channelUrls.slice(0, 10);
    }
    
    return channelUrls;
  };

  const initializeProgress = (urlsCount: number) => {
    setTotalCount(urlsCount);
    setProcessedCount(0);
    setProgress(0);
    setErrorCount(0);
    setSuccessCount(0);
    setIsProcessing(true);
  };

  const updateProgress = (processed: number, total: number) => {
    setProcessedCount(processed);
    setProgress(Math.floor((processed / total) * 100));
  };

  const processChannelUrl = async (url: string, index: number): Promise<boolean> => {
    setCurrentChannel(url);
    
    try {
      console.log(`Processing channel ${index + 1}/${totalCount}: ${url}`);
      
      // Step 1: Get channel data using the dedicated Edge Function
      const channelData = await fetchChannelData(url);
      
      // Step 2: Format the channel data
      const formattedData = formatChannelData(channelData, url, index);
      
      // Step 3: Save the channel data to the database
      const success = await saveChannelToDatabase(formattedData);
      
      if (success) {
        setSuccessCount(prev => prev + 1);
      } else {
        setErrorCount(prev => prev + 1);
      }
      
      return success;
    } catch (error) {
      console.error(`Error processing channel ${url}:`, error);
      toast.error(`Failed to process channel: ${url}`);
      setErrorCount(prev => prev + 1);
      return false;
    }
  };

  const processChannelUrls = async (urls: string) => {
    // Parse URLs, one per line
    const channelUrls = parseChannelUrls(urls);
    const urlsToProcess = validateUrlsCount(channelUrls);
    
    if (urlsToProcess.length === 0) {
      return;
    }
    
    initializeProgress(urlsToProcess.length);
    toast.info(`Starting bulk upload of ${urlsToProcess.length} channels. This may take a while.`);
    
    // Process each URL individually using the Edge Function
    for (let i = 0; i < urlsToProcess.length; i++) {
      const url = urlsToProcess[i];
      await processChannelUrl(url, i);
      updateProgress(i + 1, urlsToProcess.length);
      
      // Add a small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Show final results toast
    const summaryMessage = `Completed processing ${urlsToProcess.length} channels: ${successCount} successful, ${errorCount} failed`;
    if (errorCount > 0) {
      toast.warning(summaryMessage);
    } else {
      toast.success(summaryMessage);
    }
    
    setIsProcessing(false);
  };

  return {
    isProcessing,
    progress,
    currentChannel,
    processedCount,
    totalCount,
    errorCount,
    successCount,
    processChannelUrls
  };
};
