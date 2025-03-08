
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SelectedChannel {
  id: string;
  url: string;
  title: string;
}

export function useBulkScreenshotGenerator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [failedChannels, setFailedChannels] = useState<Array<{channel: SelectedChannel, error: string}>>([]);

  const generateScreenshotForChannel = async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Generating screenshot for channel: ${channel.title} (${channel.url})`);
      setCurrentChannel(channel.title);
      
      // Show an initial progress message for the current channel
      toast.info(`Processing screenshot for ${channel.title}. This may take up to 3 minutes.`);
      
      // Call the edge function to generate screenshot
      const { data, error } = await supabase.functions.invoke<any>('take-channel-screenshot', {
        body: { 
          channelUrl: channel.url,
          channelId: channel.id
        }
      });

      if (error) {
        console.error(`Error generating screenshot for ${channel.title}:`, error);
        const errorMessage = `API error: ${error.message}`;
        setFailedChannels(prev => [...prev, {
          channel,
          error: errorMessage
        }]);
        toast.error(`Failed to generate screenshot for ${channel.title}: ${errorMessage}`);
        return false;
      }

      if (!data || !data.success) {
        console.error(`Failed to generate screenshot for ${channel.title}:`, data?.error || "Unknown error");
        
        // Include more detailed error information
        const errorMsg = data?.error || "Unknown error occurred";
        const errorDetail = data?.message ? ` (${data.message})` : "";
        const fullErrorMessage = `${errorMsg}${errorDetail}`;
        
        setFailedChannels(prev => [...prev, {
          channel,
          error: fullErrorMessage
        }]);
        
        toast.error(`Failed to generate screenshot for ${channel.title}: ${fullErrorMessage}`);
        return false;
      }

      // If we got this far, we were successful
      console.log(`Successfully generated screenshot for ${channel.title}`);
      toast.success(`Screenshot generated for ${channel.title}`);
      return true;
    } catch (error) {
      console.error(`Exception when generating screenshot for ${channel.title}:`, error);
      const errorMessage = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
      setFailedChannels(prev => [...prev, {
        channel,
        error: errorMessage
      }]);
      toast.error(`Failed to generate screenshot for ${channel.title}: ${errorMessage}`);
      return false;
    }
  };

  const generateScreenshotsForChannels = async (channels: SelectedChannel[]) => {
    if (!channels.length) {
      toast.error("No channels selected");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    setTotalCount(channels.length);
    setCurrentChannel(null);
    setFailedChannels([]);

    toast.info(`Starting screenshot generation for ${channels.length} channels. This may take a while.`);

    try {
      // Process channels in sequence to avoid overloading
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const success = await generateScreenshotForChannel(channel);
        
        if (success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
        }
        
        // Update progress
        const newProgress = Math.floor(((i + 1) / channels.length) * 100);
        setProgress(newProgress);
        
        // Add a longer delay between requests to respect rate limits
        // The Apify API has a rate limit of 30 requests per second per resource
        if (i < channels.length - 1) {
          const delayMessage = "Waiting before processing next channel to respect API rate limits...";
          console.log(delayMessage);
          
          if (channels.length > 2) {
            toast.info(delayMessage);
          }
          
          await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay to 3s
        }
      }

      if (successCount === channels.length) {
        toast.success(`Successfully generated screenshots for all ${channels.length} channels!`);
      } else {
        toast.warning(
          `Screenshot generation completed: ${successCount} successful, ${channels.length - successCount} failed.`
        );
      }
    } catch (error) {
      console.error("Error in bulk screenshot generation process:", error);
      toast.error("Screenshot generation process encountered an error");
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
    
    toast.info(`Retrying ${failedChannels.length} failed screenshot attempts...`);
    const channelsToRetry = failedChannels.map(item => item.channel);
    setFailedChannels([]);
    await generateScreenshotsForChannels(channelsToRetry);
  };

  return {
    generateScreenshotsForChannels,
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount,
    failedChannels,
    retryFailedChannels
  };
}
