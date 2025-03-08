import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { channelTypes } from "../../constants/channelTypes";

interface SelectedChannel {
  id: string;
  url: string;
  title: string;
}

export function useBulkTypeGenerator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [failedChannels, setFailedChannels] = useState<Array<{channel: SelectedChannel, error: string}>>([]);

  const validateChannelType = (type: string): string => {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
    
    const validTypes = channelTypes.map(t => t.value);
    
    if (validTypes.includes(normalizedType)) {
      return normalizedType;
    }
    
    if (normalizedType === 'documentary_story') {
      return 'documentary';
    }
    
    const typeMap: Record<string, string> = {
      'how_to': 'tutorial',
      'educational': 'education',
      'gaming_channel': 'gaming',
      'entertainment_channel': 'entertainment',
      'music_channel': 'music',
      'news_channel': 'news',
      'tech_review': 'technology'
    };
    
    if (typeMap[normalizedType]) {
      return typeMap[normalizedType];
    }
    
    console.warn(`Channel type "${type}" is not valid, defaulting to "other"`);
    return "other";
  };

  const generateTypeForChannel = async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Generating type for channel: ${channel.title}`);
      setCurrentChannel(channel.title);
      
      const { data: channelData, error: channelError } = await supabase
        .from('youtube_channels')
        .select('description')
        .eq('id', channel.id)
        .single();
      
      if (channelError) {
        console.error(`Error fetching description for ${channel.title}:`, channelError);
        setFailedChannels(prev => [...prev, {
          channel,
          error: `Failed to fetch description: ${channelError.message}`
        }]);
        return false;
      }
      
      const description = channelData?.description || "";
      
      console.log(`Calling edge function for ${channel.title} with:`, { 
        channelTitle: channel.title, 
        description: description 
      });
      
      const { data, error } = await supabase.functions.invoke('generate-channel-type', {
        body: { 
          channelTitle: channel.title,
          description: description
        }
      });

      if (error) {
        console.error(`Error generating type for ${channel.title}:`, error);
        setFailedChannels(prev => [...prev, {
          channel,
          error: `Generation API error: ${error.message}`
        }]);
        return false;
      }

      console.log(`Generation response for ${channel.title}:`, data);

      if (!data || !data.channelType) {
        console.error(`Failed to generate type for ${channel.title}:`, data?.error || "Unknown error");
        setFailedChannels(prev => [...prev, {
          channel,
          error: data?.error || "No type returned from AI"
        }]);
        return false;
      }

      const validChannelType = validateChannelType(data.channelType);
      
      const { error: updateError } = await supabase
        .from('youtube_channels')
        .update({ channel_type: validChannelType })
        .eq('id', channel.id);

      if (updateError) {
        console.error(`Error updating type for ${channel.title}:`, updateError);
        setFailedChannels(prev => [...prev, {
          channel,
          error: `Database update error: ${updateError.message}`
        }]);
        return false;
      }
      
      console.log(`Successfully updated type for ${channel.title} to ${validChannelType}`);
      return true;
    } catch (error) {
      console.error(`Exception when generating type for ${channel.title}:`, error);
      setFailedChannels(prev => [...prev, {
        channel,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      }]);
      return false;
    }
  };

  const generateTypesForChannels = async (channels: SelectedChannel[]) => {
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

    toast.info(`Starting type generation for ${channels.length} channels. This may take a while.`);

    try {
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const success = await generateTypeForChannel(channel);
        
        if (success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
        }
        
        const newProgress = Math.floor(((i + 1) / channels.length) * 100);
        setProgress(newProgress);
        
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (errorCount === 0 && successCount > 0) {
        toast.success(`Successfully generated types for all ${channels.length} channels!`);
      } else {
        toast.warning(
          `Type generation completed: ${successCount} successful, ${channels.length - successCount} failed.`
        );
      }
    } catch (error) {
      console.error("Error in bulk type generation process:", error);
      toast.error("Type generation process encountered an error");
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
    
    const channelsToRetry = failedChannels.map(item => item.channel);
    setFailedChannels([]);
    await generateTypesForChannels(channelsToRetry);
  };

  return {
    generateTypesForChannels,
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
