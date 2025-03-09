
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

  const generateScreenshotForChannel = async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Taking screenshot for channel: ${channel.title} (${channel.url})`);
      setCurrentChannel(channel.title);
      
      toast.info(`Processing screenshot for ${channel.title}...`);
      
      const { data, error } = await supabase.functions.invoke<any>('take-channel-screenshot', {
        body: { 
          channelId: channel.id,
          channelUrl: channel.url
        }
      });

      if (error) {
        console.error(`Error taking screenshot for ${channel.title}:`, error);
        toast.error(`Failed to take screenshot for ${channel.title}: ${error.message}`);
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
      console.error(`Exception when taking screenshot for ${channel.title}:`, error);
      toast.error(`Exception when taking screenshot for ${channel.title}: ${error instanceof Error ? error.message : String(error)}`);
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

    toast.info(`Starting screenshots for ${channels.length} channels. This may take a while.`);

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
        
        // Add a small delay between requests to avoid overwhelming the API
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const currentSuccessCount = successCount + (channels.filter((_, i) => i < channels.length && i >= channels.length - errorCount).length);
      
      if (currentSuccessCount === channels.length) {
        toast.success(`Successfully took screenshots for all ${channels.length} channels!`);
      } else {
        toast.warning(
          `Screenshot process completed: ${currentSuccessCount} successful, ${channels.length - currentSuccessCount} failed.`
        );
      }
    } catch (error) {
      console.error("Error in bulk screenshot process:", error);
      toast.error(`Screenshot process encountered an error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  };

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
