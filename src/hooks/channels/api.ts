
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
    // Set up the query
    let query = supabase
      .from("youtube_channels")
      .select("*, videoStats:youtube_video_stats(*)")
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      query = query.eq("channel_category", selectedCategory as ChannelCategory);
    }

    // Add pagination
    const from = (page - 1) * CHANNELS_PER_PAGE;
    const to = from + CHANNELS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Process the data with safety checks
    if (!data || !Array.isArray(data)) return [];
    
    // Use a type assertion to avoid TypeScript's circular reference detection
    // We know the structure is compatible because our processChannelData handles the conversion safely
    return processChannelsData(data as any[]);
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
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("*, videoStats:youtube_video_stats(*)")
      .eq("is_featured", true)
      .limit(3);

    if (error) {
      throw error;
    }

    // Process the data with safety checks
    if (!data || !Array.isArray(data)) return [];
    
    // Use a type assertion that completely bypasses TypeScript's circular reference detection
    return processChannelsData(data as unknown as any[]);
  } catch (error: any) {
    console.error("Error fetching featured channels:", error);
    return [];
  }
};
