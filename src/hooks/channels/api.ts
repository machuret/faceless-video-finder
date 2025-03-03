
import { supabase } from "@/integrations/supabase/client";
import { CHANNELS_PER_PAGE } from "./types";
import { processRawChannelsData } from "./utils";
import { toast } from "sonner";

/**
 * Fetches channel count for pagination
 */
export const fetchChannelCount = async (selectedCategory: string = "") => {
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
  selectedCategory: string = "", 
  page: number = 1
): Promise<any[]> => {
  try {
    // Use a raw query string to avoid type inference issues
    const queryStr = "*, videoStats:youtube_video_stats(*)";
    
    // Build query in steps to avoid type inference issues
    let query: any = supabase
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

    if (!data) {
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
export const fetchFeaturedChannelsData = async (): Promise<any[]> => {
  try {
    // Use a raw query string to avoid type inference issues
    const queryStr = "*, videoStats:youtube_video_stats(*)";
    
    // Execute query with any type to avoid inference issues
    const { data, error }: any = await supabase
      .from("youtube_channels")
      .select(queryStr)
      .eq("is_featured", true)
      .limit(3);

    if (error) {
      throw error;
    }

    if (!data) {
      return [];
    }
    
    // Process the raw data without type issues
    return processRawChannelsData(data);
    
  } catch (error: any) {
    console.error("Error fetching featured channels:", error);
    return [];
  }
};
