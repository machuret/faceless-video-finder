
import { supabase } from "@/integrations/supabase/client";
import { CHANNELS_PER_PAGE } from "./types";
import { processRawChannelsData } from "./utils";
import { toast } from "sonner";
import { ChannelCategory } from "@/types/youtube";

/**
 * Fetches channel count for pagination
 */
export const fetchChannelCount = async (selectedCategory: ChannelCategory | "" = "") => {
  let countQuery = supabase
    .from("youtube_channels")
    .select("id", { count: "exact" });

  if (selectedCategory) {
    countQuery = countQuery.eq("channel_category", selectedCategory);
  }

  const { count, error } = await countQuery;
  
  if (error) {
    throw error;
  }
  
  return count || 0;
};

/**
 * Fetches channels with optional category filter and pagination
 * Using a different approach to avoid TypeScript circular references
 */
export const fetchChannelsData = async (
  selectedCategory: ChannelCategory | "" = "", 
  page: number = 1
) => {
  try {
    // Build query step by step without relying on TypeScript inference
    let query = supabase.from("youtube_channels");
    
    // Select all channel fields without using * to avoid type inference
    query = query.select(`
      id, channel_title, channel_url, video_id, description, 
      screenshot_url, total_subscribers, total_views, 
      channel_category, channel_type, keywords, niche, 
      country, cpm, is_featured, created_at
    `);
    
    // Add filter if category is selected
    if (selectedCategory) {
      query = query.eq("channel_category", selectedCategory);
    }
    
    // Add pagination
    const from = (page - 1) * CHANNELS_PER_PAGE;
    const to = from + CHANNELS_PER_PAGE - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);
    
    // Execute query
    const { data: channelsData, error: channelsError } = await query;
    
    if (channelsError) throw channelsError;
    if (!channelsData) return [];
    
    // Fetch video stats separately for each channel to avoid circular references
    const channels = [];
    
    for (const channel of channelsData) {
      const { data: videoStats, error: statsError } = await supabase
        .from("youtube_video_stats")
        .select("title, video_id, thumbnail_url, views, likes")
        .eq("channel_id", channel.id);
      
      if (statsError) {
        console.error("Error fetching video stats:", statsError);
      }
      
      // Combine channel with its video stats
      channels.push({
        ...channel,
        videoStats: videoStats || []
      });
    }
    
    return channels;
    
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    toast.error("Failed to fetch channels");
    throw error;
  }
};

/**
 * Fetches featured channels (limited to 3)
 * Using a different approach to avoid TypeScript circular references
 */
export const fetchFeaturedChannelsData = async () => {
  try {
    // Build query without relying on TypeScript inference
    const { data: featuredChannels, error: featuredError } = await supabase
      .from("youtube_channels")
      .select(`
        id, channel_title, channel_url, video_id, description, 
        screenshot_url, total_subscribers, total_views, 
        channel_category, channel_type, keywords, niche, 
        country, cpm, is_featured
      `)
      .eq("is_featured", true)
      .limit(3);
    
    if (featuredError) throw featuredError;
    if (!featuredChannels) return [];
    
    // Fetch video stats separately for each channel
    const channels = [];
    
    for (const channel of featuredChannels) {
      const { data: videoStats, error: statsError } = await supabase
        .from("youtube_video_stats")
        .select("title, video_id, thumbnail_url, views, likes")
        .eq("channel_id", channel.id);
      
      if (statsError) {
        console.error("Error fetching video stats:", statsError);
      }
      
      // Combine channel with its video stats
      channels.push({
        ...channel,
        videoStats: videoStats || []
      });
    }
    
    return channels;
    
  } catch (error: any) {
    console.error("Error fetching featured channels:", error);
    return [];
  }
};
