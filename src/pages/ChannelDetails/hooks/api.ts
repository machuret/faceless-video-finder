
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Channel, TopVideo } from "./types";

/**
 * Fetches a channel's details from Supabase
 * @param id Channel ID
 * @returns Channel data and video stats
 */
export const fetchChannelDetails = async (id: string) => {
  console.log(`Fetching channel details for ID: ${id}`);
  
  // Fetch channel details
  const { data: channelData, error: channelError } = await supabase
    .from("youtube_channels")
    .select("*")
    .eq("id", id)
    .single();

  if (channelError) {
    console.error("Error fetching channel details:", channelError);
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
};

/**
 * Fetches top performing videos for a YouTube channel
 * @param youtubeChannelId YouTube channel ID
 * @returns Most viewed and most engaging videos
 */
export const fetchTopPerformingVideos = async (youtubeChannelId: string) => {
  console.log(`Fetching top videos with YouTube channel ID: ${youtubeChannelId}`);
  
  const { data, error } = await supabase.functions.invoke('fetch-top-videos', {
    body: { channelId: youtubeChannelId }
  });

  if (error) {
    console.error("Error fetching top videos:", error);
    throw error;
  }

  if (data.error) {
    console.error("API error fetching top videos:", data.error);
    throw new Error(data.error);
  }

  return {
    mostViewedVideo: data.mostViewed as TopVideo || null,
    mostEngagingVideo: data.mostEngaging as TopVideo || null
  };
};
