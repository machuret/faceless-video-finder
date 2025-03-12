
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";

/**
 * Fetches a channel's details from Supabase
 * @param id Channel ID
 * @returns Channel data and video stats
 */
export const fetchChannelDetails = async (id: string) => {
  console.log(`Fetching channel details for ID: ${id}`);
  
  try {
    // Try direct query first with error handling
    const { data: channelData, error: channelError } = await supabase
      .from("youtube_channels")
      .select("*")
      .eq("id", id)
      .single();

    if (channelError) {
      console.error("Error fetching channel details:", channelError);
      
      // Try using our fixed edge function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-channel-by-id', {
        body: { channelId: id }
      });
      
      if (edgeError) {
        throw new Error(`Edge function error: ${edgeError.message}`);
      }
      
      if (edgeData?.channel) {
        console.log("Successfully fetched channel using edge function");
        
        return {
          channel: edgeData.channel as Channel,
          videoStats: edgeData.videoStats || []
        };
      }
      
      throw channelError;
    }
    
    if (!channelData) {
      console.error("No channel found with ID:", id);
      throw new Error("Channel not found");
    }
    
    // Fetch video stats for this channel
    const { data: videoData, error: videoError } = await supabase
      .from("youtube_video_stats")
      .select("*")
      .eq("channel_id", id);
      
    if (videoError) throw videoError;

    return {
      channel: channelData as unknown as Channel,
      videoStats: videoData || []
    };
  } catch (error) {
    console.error("Error in fetchChannelDetails:", error);
    throw error;
  }
};
