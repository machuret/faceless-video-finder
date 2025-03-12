
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";

/**
 * Fetches a channel's details from Supabase with optimized field selection
 * @param id Channel ID
 * @returns Channel data and video stats
 */
export const fetchChannelDetails = async (id: string) => {
  console.log(`Fetching channel details for ID: ${id}`);
  
  try {
    // Try edge function first as it's more reliable with RLS issues
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-channel-by-id', {
      body: { 
        channelId: id,
        // We're fetching a specific channel, so no need to limit fields
        // as we'll need the complete data for the details page
      }
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
    
    // Try direct query as fallback - selecting specific fields for better performance
    // Define the basic fields to select for the channel
    const { data: channelData, error: channelError } = await supabase
      .from("youtube_channels")
      .select("*") // For full channel details, we need all fields
      .eq("id", id)
      .maybeSingle(); // Using maybeSingle() instead of single() to avoid errors if no records

    if (channelError) {
      console.error("Error fetching channel details:", channelError);
      throw new Error(channelError.message);
    }
    
    if (!channelData) {
      console.error("No channel found with ID:", id);
      throw new Error("Channel not found");
    }
    
    // For video stats, select only necessary fields
    const videoStatsFields = 'id, video_id, title, thumbnail_url, views, likes, channel_id';
    
    // Fetch video stats for this channel
    const { data: videoData, error: videoError } = await supabase
      .from("youtube_video_stats")
      .select(videoStatsFields)
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
