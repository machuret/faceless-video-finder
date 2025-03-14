
import { supabase } from "@/integrations/supabase/client";
import { CHANNELS_PER_PAGE } from "./types";
import { Channel, ChannelCategory } from "@/types/youtube";
import { toast } from "sonner";

/**
 * Fetches channel count for pagination
 */
export const fetchChannelCount = async (selectedCategory: ChannelCategory | "" = "") => {
  try {
    // Build the count query
    let query = supabase.from("youtube_channels").select("*", { count: "exact", head: true });
    
    // Add category filter if provided
    if (selectedCategory) {
      query = query.eq("channel_category", selectedCategory);
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error("Error fetching channel count:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error in fetchChannelCount:", error);
    return 0;
  }
};

/**
 * Fetches channels with optional category filter and pagination
 */
export const fetchChannelsData = async (
  selectedCategory: ChannelCategory | "" = "", 
  page: number = 1
) => {
  try {
    console.log(`Fetching channels for category: "${selectedCategory}", page: ${page}`);
    
    // Calculate pagination range
    const from = (page - 1) * CHANNELS_PER_PAGE;
    const to = from + CHANNELS_PER_PAGE - 1;
    
    // Build the query
    let query = supabase
      .from("youtube_channels")
      .select(`
        id, channel_title, channel_url, video_id, description, 
        screenshot_url, total_subscribers, total_views, 
        channel_category, channel_type, keywords, niche, 
        country, cpm, created_at, metadata, is_featured
      `);
    
    // Add category filter if selected
    if (selectedCategory) {
      query = query.eq("channel_category", selectedCategory);
    }
    
    // Add pagination and ordering
    query = query.order('created_at', { ascending: false }).range(from, to);
    
    // Execute the query
    const { data: channelsData, error: channelsError } = await query;
    
    if (channelsError) {
      console.error("Error fetching channels:", channelsError);
      throw channelsError;
    }
    
    if (!channelsData) {
      console.log("No channel data returned");
      return [];
    }
    
    console.log(`Found ${channelsData.length} channels`);
    
    // For each channel, fetch its video stats
    const channels = [];
    
    for (const channel of channelsData) {
      // Fetch video stats for this channel
      const { data: videoStats, error: videoStatsError } = await supabase
        .from("youtube_video_stats")
        .select("title, video_id, thumbnail_url, views, likes")
        .eq("channel_id", channel.id);
      
      if (videoStatsError) {
        console.error(`Error fetching video stats for channel ${channel.id}:`, videoStatsError);
      }
      
      // Add the channel with its video stats to the result
      channels.push({
        ...channel,
        videoStats: videoStats || []
      } as Channel);
    }
    
    return channels as Channel[];
  } catch (error: any) {
    console.error("Error in fetchChannelsData:", error);
    toast.error("Failed to fetch channels data");
    throw error;
  }
};

/**
 * Fetches featured channels (limited to 3)
 */
export const fetchFeaturedChannelsData = async () => {
  try {
    console.log("Fetching featured channels");
    
    // Query for featured channels using the is_featured column
    const { data, error } = await supabase
      .from("youtube_channels")
      .select(`
        id, channel_title, channel_url, video_id, description, 
        screenshot_url, total_subscribers, total_views, 
        channel_category, channel_type, keywords, niche, 
        country, cpm, is_featured, metadata
      `)
      .eq("is_featured", true)
      .limit(3);
    
    if (error) {
      console.error("Error fetching featured channels:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No featured channels found");
      return [];
    }
    
    console.log(`Found ${data.length} featured channels`);
    
    // For each channel, fetch its video stats
    const featuredChannels = [];
    
    for (const channel of data) {
      // Fetch video stats for this channel
      const { data: videoStats, error: videoStatsError } = await supabase
        .from("youtube_video_stats")
        .select("title, video_id, thumbnail_url, views, likes")
        .eq("channel_id", channel.id);
      
      if (videoStatsError) {
        console.error(`Error fetching video stats for featured channel ${channel.id}:`, videoStatsError);
      }
      
      // Add the channel with its video stats to the result
      featuredChannels.push({
        ...channel,
        videoStats: videoStats || []
      } as Channel);
    }
    
    return featuredChannels as Channel[];
  } catch (error) {
    console.error("Error in fetchFeaturedChannelsData:", error);
    return [];
  }
};
