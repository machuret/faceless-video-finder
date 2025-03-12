
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
      let description = "";
      let category = "";
      
      try {
        // First try using the edge function for better reliability
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-channel-data', {
          body: { channelId: channel.id }
        });
        
        if (edgeError) {
          console.warn(`Edge function error for ${channel.title}:`, edgeError);
        } else if (edgeData?.channel) {
          description = edgeData.channel.description || "";
          category = edgeData.channel.channel_category || "";
          console.log(`Got channel data from edge function for ${channel.title}`);
        }
      } catch (edgeFetchError) {
        console.warn(`Edge function fetch failed for ${channel.title}:`, edgeFetchError);
      }
      
      // Fallback to direct query if edge function didn't work
      if (!description || !category) {
        try {
          const { data: channelData, error: channelError } = await supabase
            .from('youtube_channels')
            .select('description, channel_category')
            .eq('id', channel.id)
            .single();
          
          if (channelError) {
            console.error(`Error fetching description for ${channel.title}:`, channelError);
            // Continue with empty values rather than failing completely
          } else if (channelData) {
            description = channelData.description || "";
            category = channelData.channel_category || "";
          }
        } catch (dbError) {
          console.error(`Database error for ${channel.title}:`, dbError);
          // Continue with empty values rather than failing completely
        }
      }
      
      console.log(`Calling generate-channel-keywords for ${channel.title} with:`, {
        title: channel.title, 
        description, 
        category
      });
      
      // Call the edge function to generate keywords with retry mechanism
      let retryCount = 0;
      const maxRetries = 2;
      let success = false;
      
      while (retryCount <= maxRetries && !success) {
        try {
          const { data, error } = await supabase.functions.invoke('generate-channel-keywords', {
            body: {
              title: channel.title,
              description: description,
              category: category
            }
          });
          
          console.log(`Keywords generation attempt ${retryCount + 1} result:`, data);

          if (error) {
            console.error(`Error (attempt ${retryCount + 1}) generating keywords for ${channel.title}:`, error);
            retryCount++;
            if (retryCount <= maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
              continue;
            }
            return false;
          }

          if (!data || !data.keywords || !Array.isArray(data.keywords)) {
            console.error(`Failed (attempt ${retryCount + 1}) to generate keywords for ${channel.title}:`, data?.error || "Invalid response format");
            retryCount++;
            if (retryCount <= maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
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
          
          console.log(`Successfully updated keywords for ${channel.title}:`, data.keywords);
          success = true;
          return true;
        } catch (attemptError) {
          console.error(`Exception (attempt ${retryCount + 1}) when generating keywords for ${channel.title}:`, attemptError);
          retryCount++;
          if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
      
      return success;
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
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const successfulCount = successCount;
      const failedCount = errorCount;
      
      if (successfulCount === channels.length) {
        toast.success(`Successfully generated keywords for all ${channels.length} channels!`);
      } else if (successfulCount > 0) {
        toast.warning(
          `Keywords generation completed: ${successfulCount} successful, ${failedCount} failed.`
        );
      } else {
        toast.error(
          `Keywords generation failed for all channels. Please try again later.`
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
