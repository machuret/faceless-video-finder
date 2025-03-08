
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const generateTypeForChannel = async (channel: SelectedChannel): Promise<boolean> => {
    try {
      console.log(`Generating type for channel: ${channel.title}`);
      setCurrentChannel(channel.title);
      
      // Get channel description for better type generation
      const { data: channelData, error: channelError } = await supabase
        .from('youtube_channels')
        .select('description')
        .eq('id', channel.id)
        .single();
      
      if (channelError) {
        console.error(`Error fetching description for ${channel.title}:`, channelError);
        return false;
      }
      
      const description = channelData?.description || "";
      
      // Call the edge function to generate channel type
      const { data, error } = await supabase.functions.invoke<any>('generate-channel-type', {
        body: { 
          channelTitle: channel.title,
          description: description
        }
      });

      if (error) {
        console.error(`Error generating type for ${channel.title}:`, error);
        return false;
      }

      console.log(`Generation response for ${channel.title}:`, data);

      if (!data || !data.channelType) {
        console.error(`Failed to generate type for ${channel.title}:`, data?.error || "Unknown error");
        return false;
      }

      // Update the channel with the new type
      const { error: updateError } = await supabase
        .from('youtube_channels')
        .update({ channel_type: data.channelType })
        .eq('id', channel.id);

      if (updateError) {
        console.error(`Error updating type for ${channel.title}:`, updateError);
        return false;
      }
      
      console.log(`Successfully updated type for ${channel.title} to ${data.channelType}`);
      return true;
    } catch (error) {
      console.error(`Exception when generating type for ${channel.title}:`, error);
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

    toast.info(`Starting type generation for ${channels.length} channels. This may take a while.`);

    try {
      // Process channels in sequence to avoid overloading
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const success = await generateTypeForChannel(channel);
        
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

  return {
    generateTypesForChannels,
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount
  };
}
