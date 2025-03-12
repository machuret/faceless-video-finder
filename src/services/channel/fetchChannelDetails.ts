
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
    // Try edge function first as it's more reliable with RLS issues
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-channel-by-id', {
      body: { channelId: id }
    });
    
    if (edgeError) {
      console.error("Edge function error:", edgeError.message);
      // Fall back to direct query if edge function fails
    } else if (edgeData?.channel) {
      console.log("Successfully fetched channel using edge function");
      
      return {
        channel: edgeData.channel as Channel,
        videoStats: edgeData.videoStats || []
      };
    }
    
    // Try direct query as fallback
    const { data: channelData, error: channelError } = await supabase
      .from("youtube_channels")
      .select("*")
      .eq("id", id)
      .single();

    if (channelError) {
      console.error("Error fetching channel details:", channelError);
      throw new Error(channelError.message);
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
