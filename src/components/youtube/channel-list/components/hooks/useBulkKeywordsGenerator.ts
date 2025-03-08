
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SelectedChannel {
  id: string;
  url: string;
  title: string;
}

export function useBulkKeywordsGenerator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const generateKeywordsForChannel = async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Generating keywords for channel: ${channel.title}`);
      setCurrentChannel(channel.title);
      
      // Get channel description and category for better keyword generation
      const { data: channelData, error: channelError } = await supabase
        .from('youtube_channels')
        .select('description, channel_category')
        .eq('id', channel.id)
        .single();
      
      if (channelError) {
        console.error(`Error fetching description for ${channel.title}:`, channelError);
        return false;
      }
      
      const description = channelData?.description || "";
      const category = channelData?.channel_category || "";
      
      // Call the edge function to generate keywords
      const { data, error } = await supabase.functions.invoke<any>('generate-channel-keywords', {
        body: {
          title: channel.title,
          description: description,
          category: category
        }
      });

      if (error) {
        console.error(`Error generating keywords for ${channel.title}:`, error);
        return false;
      }

      if (!data || !data.keywords || !Array.isArray(data.keywords)) {
        console.error(`Failed to generate keywords for ${channel.title}:`, data?.error || "Unknown error");
        return false;
      }

      // Update the channel with the new keywords
      const { error: updateError } = await supabase
        .from('youtube_channels')
        .update({ keywords: data.keywords })
        .eq('id', channel.id);

      if (updateError) {
        console.error(`Error updating keywords for ${channel.title}:`, updateError);
        return false;
      }
      
      console.log(`Successfully updated keywords for ${channel.title}`);
      return true;
    } catch (error) {
      console.error(`Exception when generating keywords for ${channel.title}:`, error);
      return false;
    }
  };

  const generateKeywordsForChannels = async (channels: SelectedChannel[]) => {
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

    toast.info(`Starting keywords generation for ${channels.length} channels. This may take a while.`);

    try {
      // Process channels in sequence to avoid overloading
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const success = await generateKeywordsForChannel(channel);
        
        if (success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
        }
        
        // Update progress
        const newProgress = Math.floor(((i + 1) / channels.length) * 100);
        setProgress(newProgress);
        
        // Add a small delay between requests to avoid rate limiting
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (successCount === channels.length) {
        toast.success(`Successfully generated keywords for all ${channels.length} channels!`);
      } else {
        toast.warning(
          `Keywords generation completed: ${successCount} successful, ${channels.length - successCount} failed.`
        );
      }
    } catch (error) {
      console.error("Error in bulk keywords generation process:", error);
      toast.error("Keywords generation process encountered an error");
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  };

  return {
    generateKeywordsForChannels,
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount
  };
}
