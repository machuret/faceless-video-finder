
import { useState, useCallback } from "react";
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
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});

  // Memoized function to generate screenshot for a single channel
  const generateScreenshotForChannel = useCallback(async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Taking screenshot for channel: ${channel.title} (${channel.url})`);
      setCurrentChannel(channel.title);
      
      toast.info(`Processing screenshot for ${channel.title}...`);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const { data, error } = await supabase.functions.invoke<any>('take-channel-screenshot', {
        body: { 
          channelId: channel.id,
          channelUrl: channel.url
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (error) {
        if (error.name === 'AbortError') {
          console.error(`Timeout taking screenshot for ${channel.title}`);
          toast.error(`Timeout while taking screenshot for ${channel.title}`);
        } else {
          console.error(`Error taking screenshot for ${channel.title}:`, error);
          toast.error(`Failed to take screenshot for ${channel.title}: ${error.message}`);
        }
        return false;
      }

      if (!data || !data.success) {
        console.error(`Failed to take screenshot for ${channel.title}:`, data?.error || "Unknown error");
        toast.error(`Failed to take screenshot for ${channel.title}: ${data?.error || "Unknown error"}`);
        return false;
      }

      console.log(`Successfully took screenshot for ${channel.title}: ${data.screenshotUrl}`);
      toast.success(`Successfully took screenshot for ${channel.title}`);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`Timeout taking screenshot for ${channel.title}`);
        toast.error(`Timeout while taking screenshot for ${channel.title}`);
      } else {
        console.error(`Exception when taking screenshot for ${channel.title}:`, error);
        toast.error(`Exception when taking screenshot for ${channel.title}: ${error instanceof Error ? error.message : String(error)}`);
      }
      return false;
    }
  }, []);

  const generateScreenshotsForChannels = useCallback(async (channels: SelectedChannel[]) => {
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
    setRetryAttempts({});

    const failedChannels: SelectedChannel[] = [];
    toast.info(`Starting screenshots for ${channels.length} channels. This may take a while.`);

    try {
      // Process channels in sequence to avoid overloading
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        
        // Try up to 2 times for each channel
        let success = false;
        const attemptCount = retryAttempts[channel.id] || 0;
        
        if (attemptCount < 2) {
          success = await generateScreenshotForChannel(channel);
          
          // Update retry attempts
          setRetryAttempts(prev => ({
            ...prev,
            [channel.id]: attemptCount + 1
          }));
        }
        
        if (success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
          failedChannels.push(channel);
        }
        
        // Update progress
        const newProgress = Math.floor(((i + 1) / channels.length) * 100);
        setProgress(newProgress);
        
        // Add a small delay between requests to avoid overwhelming the API
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (failedChannels.length === 0) {
        toast.success(`Successfully took screenshots for all ${channels.length} channels!`);
      } else if (failedChannels.length < channels.length) {
        toast.warning(
          `Screenshot process completed: ${successCount} successful, ${failedChannels.length} failed.`
        );
        
        // Option to retry failed channels
        if (failedChannels.length > 0 && failedChannels.length <= 5) {
          setTimeout(() => {
            if (confirm(`Would you like to retry the ${failedChannels.length} failed channels?`)) {
              generateScreenshotsForChannels(failedChannels);
            }
          }, 1000);
        }
      } else {
        toast.error(`Failed to take screenshots for all ${channels.length} channels.`);
      }
    } catch (error) {
      console.error("Error in bulk screenshot process:", error);
      toast.error(`Screenshot process encountered an error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  }, [generateScreenshotForChannel, retryAttempts]);

  return {
    generateScreenshotsForChannels,
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount
  };
}
