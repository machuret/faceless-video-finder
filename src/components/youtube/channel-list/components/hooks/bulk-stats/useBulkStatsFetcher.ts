
import { toast } from "sonner";
import { SelectedChannel, UseBulkStatsFetcherResult } from "./types";
import { fetchStatsForSingleChannel } from "./statsFetcher";
import { useStatsState } from "./useStatsState";

export function useBulkStatsFetcher(): UseBulkStatsFetcherResult {
  const {
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    currentChannel,
    setCurrentChannel,
    successCount,
    incrementSuccessCount,
    errorCount,
    incrementErrorCount,
    totalCount,
    setTotalCount,
    statsResults,
    addStatsResult,
    failedChannels,
    addFailedChannel,
    resetState,
    clearFailedChannels
  } = useStatsState();

  const fetchStatsForChannels = async (channels: SelectedChannel[]) => {
    if (!channels.length) {
      toast.error("No channels selected");
      return;
    }

    resetState();
    setIsProcessing(true);
    setTotalCount(channels.length);

    toast.info(`Starting stats fetch for ${channels.length} channels. This may take a while.`);

    try {
      // Process channels in sequence to avoid overloading
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        setCurrentChannel(channel.title);
        
        const result = await fetchStatsForSingleChannel(
          channel,
          incrementSuccessCount,
          (errorMessage) => {
            incrementErrorCount();
            addFailedChannel({ channel, error: errorMessage });
          }
        );
        
        if (result) {
          addStatsResult(result);
        }
        
        // Update progress
        const newProgress = Math.floor(((i + 1) / channels.length) * 100);
        setProgress(newProgress);
        
        // Add a longer delay between requests to respect rate limits
        if (i < channels.length - 1) {
          const delayMessage = "Waiting before processing next channel to respect API rate limits...";
          console.log(delayMessage);
          
          if (channels.length > 2) {
            toast.info(delayMessage);
          }
          
          await new Promise(resolve => setTimeout(resolve, 3000)); // Delay of 3s
        }
      }

      if (successCount === channels.length) {
        toast.success(`Successfully fetched stats for all ${channels.length} channels!`);
      } else if (successCount > 0) {
        toast.warning(
          `Stats fetch completed: ${successCount} successful, ${channels.length - successCount} failed.`
        );
      } else {
        toast.error(`Failed to fetch stats for all ${channels.length} channels. Please try again later.`);
      }
    } catch (error) {
      console.error("Error in bulk stats fetch process:", error);
      toast.error("Stats fetch process encountered an error");
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  };

  const retryFailedChannels = async () => {
    if (failedChannels.length === 0) {
      toast.info("No failed channels to retry");
      return;
    }
    
    toast.info(`Retrying ${failedChannels.length} failed channels...`);
    const channelsToRetry = failedChannels.map(item => item.channel);
    clearFailedChannels();
    await fetchStatsForChannels(channelsToRetry);
  };

  return {
    fetchStatsForChannels,
    retryFailedChannels,
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount,
    statsResults,
    failedChannels
  };
}
