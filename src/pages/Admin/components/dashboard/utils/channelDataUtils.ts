
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Channel } from "@/types/youtube";

/**
 * Fetch channel data from Edge Function
 */
export const fetchChannelData = async (url: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
      body: { url }
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`API Error: ${error.message}`);
    }

    if (!data || !data.success) {
      console.error("Invalid data from edge function:", data);
      throw new Error(data?.error || "Failed to fetch channel data");
    }

    console.log("Channel data received:", data);
    return data;
  } catch (error) {
    console.error(`Error fetching channel data for ${url}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

/**
 * Format channel data for database storage
 */
export const formatChannelData = (channelData: any, url: string, index: number) => {
  // Map channel type (default to "other" if not provided)
  const channelType = mapToChannelType(channelData.channelType || "other");
  
  // Set default values for missing fields
  return {
    video_id: channelData.id || `manual-${Date.now()}-${index}`,
    channel_title: channelData.title || `Unknown Channel (${index + 1})`,
    channel_url: channelData.url || url,
    description: channelData.description || "",
    total_subscribers: channelData.subscriberCount || null,
    total_views: channelData.viewCount || null,
    start_date: channelData.startDate || null,
    video_count: channelData.videoCount || null,
    country: channelData.country || "US",
    channel_type: channelType,
    channel_category: mapToChannelCategory(channelData.category || "entertainment"),
    metadata: {
      ui_channel_type: channelType,
      data_source: channelData.source || "manual",
      processed_at: new Date().toISOString()
    }
  };
};

/**
 * Save channel data to database
 * Returns success status and whether this was a new channel
 */
export const saveChannelToDatabase = async (channelData: any): Promise<{ success: boolean, isNew: boolean }> => {
  try {
    // First check if channel already exists by URL
    const { data: existingChannel, error: lookupError } = await supabase
      .from("youtube_channels")
      .select("id")
      .eq("channel_url", channelData.channel_url)
      .maybeSingle();
    
    if (lookupError) {
      console.error("Error checking for existing channel:", lookupError);
      return { success: false, isNew: false };
    }
    
    let result;
    let isNew = false;
    
    if (existingChannel) {
      // Update existing channel
      result = await supabase
        .from("youtube_channels")
        .update(channelData)
        .eq("id", existingChannel.id);
        
      if (result.error) {
        throw new Error(`Error updating channel: ${result.error.message}`);
      }
      
      toast.success(`Updated channel: ${channelData.channel_title}`);
    } else {
      // Insert new channel
      result = await supabase
        .from("youtube_channels")
        .insert(channelData);
        
      if (result.error) {
        throw new Error(`Error creating channel: ${result.error.message}`);
      }
      
      isNew = true;
      toast.success(`Added new channel: ${channelData.channel_title}`);
    }
    
    return { success: true, isNew };
  } catch (error) {
    console.error("Error saving channel to database:", error);
    return { success: false, isNew: false };
  }
};

/**
 * Map UI channel type to database-compatible type
 */
const mapToChannelType = (value: string): "creator" | "brand" | "media" | "other" => {
  if (value === "creator" || value === "brand" || value === "media") {
    return value;
  }
  return "other";
};

/**
 * Map category to valid channel category
 */
const mapToChannelCategory = (value: string): string => {
  const validCategories = [
    "entertainment", "education", "gaming", "music", 
    "news", "sports", "technology", "other"
  ];
  
  if (validCategories.includes(value)) {
    return value;
  }
  
  return "entertainment";
};
