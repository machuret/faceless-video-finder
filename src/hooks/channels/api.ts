
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelCategory } from "@/types/youtube";
import { CHANNELS_PER_PAGE } from "./types";
import { processChannelsData } from "./utils";
import { toast } from "sonner";

/**
 * Fetches channel count for pagination
 */
export const fetchChannelCount = async (selectedCategory: ChannelCategory | "" = "") => {
  let countQuery = supabase
    .from("youtube_channels")
    .select("id", { count: "exact" });

  if (selectedCategory) {
    countQuery = countQuery.eq("channel_category", selectedCategory as ChannelCategory);
  }

  const { count, error } = await countQuery;
  
  if (error) {
    throw error;
  }
  
  return count || 0;
};

/**
 * Fetches channels with optional category filter and pagination
 */
export const fetchChannelsData = async (
  selectedCategory: ChannelCategory | "" = "", 
  page: number = 1
): Promise<Channel[]> => {
  try {
    // Build the query in steps to avoid type issues
    let query = supabase
      .from("youtube_channels")
      .select("*, videoStats:youtube_video_stats(*)");

    // Add filters and pagination
    query = query.order("created_at", { ascending: false });

    if (selectedCategory) {
      query = query.eq("channel_category", selectedCategory as ChannelCategory);
    }

    const from = (page - 1) * CHANNELS_PER_PAGE;
    const to = from + CHANNELS_PER_PAGE - 1;
    query = query.range(from, to);

    // Execute the query
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // If no data, return empty array
    if (!data) return [];
    
    // Use explicit any[] type assertion to break circular references
    const typedData: any[] = data;
    return processChannelsData(typedData);
    
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    toast.error("Failed to fetch channels");
    throw error;
  }
};

/**
 * Fetches featured channels (limited to 3)
 */
export const fetchFeaturedChannelsData = async (): Promise<Channel[]> => {
  try {
    // Simple query with explicit steps
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("*, videoStats:youtube_video_stats(*)")
      .eq("is_featured", true)
      .limit(3);

    if (error) {
      throw error;
    }

    // If no data, return empty array
    if (!data) return [];
    
    // Use explicit any[] type assertion to break circular references
    const typedData: any[] = data;
    return processChannelsData(typedData);
    
  } catch (error: any) {
    console.error("Error fetching featured channels:", error);
    return [];
  }
};
