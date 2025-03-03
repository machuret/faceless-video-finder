
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelCategory } from "@/types/youtube";
import { CHANNELS_PER_PAGE } from "./types";
import { processRawChannelsData } from "./utils";
import { toast } from "sonner";

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
 * Completely rewritten to avoid TypeScript circular references
 */
export const fetchChannelsData = async (
  selectedCategory: ChannelCategory | "" = "", 
  page: number = 1
): Promise<Channel[]> => {
  try {
    // Simple string-based query to avoid TypeScript circular references
    const queryStr = "*, videoStats:youtube_video_stats(*)";
    
    // Build query in steps
    let query = supabase
      .from("youtube_channels")
      .select(queryStr)
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      query = query.eq("channel_category", selectedCategory);
    }

    const from = (page - 1) * CHANNELS_PER_PAGE;
    const to = from + CHANNELS_PER_PAGE - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // Process the raw data without type issues
    return processRawChannelsData(data);
    
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    toast.error("Failed to fetch channels");
    throw error;
  }
};

/**
 * Fetches featured channels (limited to 3)
 * Completely rewritten to avoid TypeScript circular references
 */
export const fetchFeaturedChannelsData = async (): Promise<Channel[]> => {
  try {
    // Simple string-based query to avoid TypeScript circular references
    const queryStr = "*, videoStats:youtube_video_stats(*)";
    
    // Execute query
    const { data, error } = await supabase
      .from("youtube_channels")
      .select(queryStr)
      .eq("is_featured", true)
      .limit(3);

    if (error) {
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    // Process the raw data without type issues
    return processRawChannelsData(data);
    
  } catch (error: any) {
    console.error("Error fetching featured channels:", error);
    return [];
  }
};
