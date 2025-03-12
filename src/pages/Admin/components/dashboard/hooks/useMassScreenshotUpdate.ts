
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useMassScreenshotUpdate = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [processedChannels, setProcessedChannels] = useState(0);
  const [totalChannels, setTotalChannels] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [updatedChannels, setUpdatedChannels] = useState<string[]>([]);
  
  const fetchChannelsForScreenshotUpdate = async () => {
    try {
      // Use the edge function to bypass RLS issues
      const { data: countData, error: countError } = await supabase.functions.invoke('get-public-channels', {
        body: { 
          countOnly: true,
          missingScreenshot: true
        }
      });
      
      if (countError) {
        throw new Error(`Error fetching count: ${countError.message}`);
      }
      
      const count = countData?.totalCount || 0;
      console.log(`Found ${count} channels missing screenshots (count via edge function)`);
      
      // Now fetch the actual channel data
      const { data: channelsData, error: channelsError } = await supabase.functions.invoke('get-public-channels', {
        body: { 
          limit: 100, // Increase limit to process more channels
          offset: 0,
          missingScreenshot: true
        }
      });
      
      if (channelsError) {
        throw new Error(`Error fetching channels: ${channelsError.message}`);
      }
      
      const channels = channelsData?.channels || [];
      console.log(`Fetched ${channels.length} channels missing screenshots (via edge function)`);
      
      return { channels, count };
    } catch (error) {
      console.error("Error fetching channels for screenshot update:", error);
      throw error; // Re-throw to handle in caller
    }
  };
  
  const updateScreenshotForChannel = async (
    channelId: string, 
    channelUrl: string, 
    channelTitle: string
  ) => {
    try {
      console.log(`Taking screenshot for channel: ${channelTitle} (${channelUrl})`);
      
      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: { 
          channelId,
          channelUrl
        }
      });
      
      if (error) {
        console.error(`Error taking screenshot for ${channelTitle}:`, error);
        return { 
          success: false, 
          message: `Failed to take screenshot for ${channelTitle}: ${error.message}`
        };
      }
      
      if (!data || !data.success) {
        console.error(`Failed to take screenshot for ${channelTitle}:`, data?.error || "Unknown error");
        return { 
          success: false, 
          message: `Failed to take screenshot for ${channelTitle}: ${data?.error || "Unknown error"}`
        };
      }
      
      console.log(`Successfully took screenshot for ${channelTitle}: ${data.screenshotUrl}`);
      return { 
        success: true, 
        message: `Successfully took screenshot for ${channelTitle}`,
        screenshotUrl: data.screenshotUrl
      };
    } catch (error) {
      console.error(`Exception when taking screenshot for ${channelTitle}:`, error);
      return { 
        success: false, 
        message: `Error taking screenshot for ${channelTitle}: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  };
  
  const startMassUpdate = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentChannel(null);
    setProcessedChannels(0);
    setTotalChannels(0);
    setErrors([]);
    setSuccessCount(0);
    setErrorCount(0);
    setUpdatedChannels([]);
    
    try {
      const { channels, count } = await fetchChannelsForScreenshotUpdate();
      
      if (channels.length === 0) {
        toast.info("No channels found missing screenshots");
        setIsProcessing(false);
        return;
      }
      
      setTotalChannels(count);
      toast.info(`Starting screenshot update for ${channels.length} channels. This may take a while.`);
      
      const newErrors: string[] = [];
      const updatedList: string[] = [];
      
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const channelTitle = channel.channel_title || `Channel ${i+1}`;
        
        setCurrentChannel(channelTitle);
        
        const result = await updateScreenshotForChannel(
          channel.id,
          channel.channel_url,
          channelTitle
        );
        
        if (result.success) {
          setSuccessCount(prev => prev + 1);
          updatedList.push(`${channelTitle} (${result.screenshotUrl || 'screenshot updated'})`);
        } else {
          setErrorCount(prev => prev + 1);
          newErrors.push(result.message);
        }
        
        const newProcessedCount = i + 1;
        setProcessedChannels(newProcessedCount);
        
        const newProgress = Math.floor((newProcessedCount / channels.length) * 100);
        setProgress(newProgress);
        
        if ((newProcessedCount % 5 === 0) || newProcessedCount === channels.length) {
          toast.info(`Screenshot progress: ${newProcessedCount}/${channels.length} channels processed`);
        }
        
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      setErrors(newErrors);
      setUpdatedChannels(updatedList);
      
      if (errorCount > 0) {
        toast.warning(
          `Screenshot update completed: ${successCount} successful, ${errorCount} failed.`
        );
      } else {
        toast.success(`Successfully updated screenshots for all ${successCount} channels!`);
      }
      
      console.log("Channels updated with screenshots:", updatedList);
    } catch (error) {
      console.error("Error in mass screenshot update:", error);
      toast.error(`Screenshot update process encountered an error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  }, []);
  
  const cancelUpdate = useCallback(() => {
    setIsProcessing(false);
    toast.info("Screenshot update cancelled");
  }, []);
  
  return {
    startMassUpdate,
    cancelUpdate,
    isProcessing,
    progress,
    currentChannel,
    processedChannels,
    totalChannels,
    errors,
    successCount,
    errorCount,
    updatedChannels
  };
};
