
import { supabase } from "@/integrations/supabase/client";
import type { Channel, ChannelMetadata, DatabaseChannelType } from "@/types/youtube";
import { toast } from "sonner";

/**
 * Fetch all channels from the database
 */
export const fetchAllChannels = async (): Promise<Channel[]> => {
  const { data, error } = await supabase
    .from("youtube_channels")
    .select("*, videoStats:youtube_video_stats(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching channels:", error);
    toast.error("Failed to fetch channels");
    throw error;
  }

  // Process the data to handle custom channel types from metadata
  const processedData = data.map(channel => {
    // Check if the channel has metadata with ui_channel_type
    if (channel.metadata && typeof channel.metadata === 'object' && 'ui_channel_type' in channel.metadata) {
      const typedMetadata = channel.metadata as ChannelMetadata;
      console.log(`Using ui_channel_type from metadata for ${channel.channel_title}: ${typedMetadata.ui_channel_type}`);
      // Use the UI channel type from metadata for display
      return {
        ...channel,
        metadata: typedMetadata,
        channel_type: typedMetadata.ui_channel_type
      } as Channel;
    }
    // Ensure metadata is properly cast to ChannelMetadata
    return {
      ...channel,
      metadata: channel.metadata as ChannelMetadata
    } as Channel;
  });

  return processedData;
};

/**
 * Update a channel in the database, including metadata for custom channel types
 */
export const updateChannel = async (channel: Channel): Promise<boolean> => {
  console.log("=== STARTING CHANNEL UPDATE ===");
  console.log("Channel to update:", channel);
  
  try {
    // 1. Calculate any derived values
    const potentialRevenue = channel.total_views ? channel.total_views * (channel.cpm || 4) / 1000 : null;
    const revenuePerVideo = potentialRevenue && channel.video_count ? potentialRevenue / channel.video_count : null;
    const revenuePerMonth = calculateRevenuePerMonth(channel.total_views, channel.cpm, channel.start_date);
    
    // 2. Process the UI channel type
    // Get the UI channel type from metadata first, then fallback to channel_type
    const uiChannelType = channel.metadata && typeof channel.metadata === 'object' && 'ui_channel_type' in channel.metadata
      ? (channel.metadata as ChannelMetadata).ui_channel_type
      : channel.channel_type || "other";
    
    console.log("UI Channel Type for update:", uiChannelType);
    
    // Determine the database channel type (must be one of the enum values)
    let dbChannelType: DatabaseChannelType;
    // Map the UI channel type to a valid database enum value
    // This could be more sophisticated with a mapping table
    if (["educational", "entertainment", "gaming", "howto", "music", "news", "other", "sports", "tech"].includes(uiChannelType)) {
      dbChannelType = uiChannelType as DatabaseChannelType;
    } else {
      // Default to 'other' if not a valid enum value
      dbChannelType = "other";
    }
    console.log("Mapped to DB Channel Type:", dbChannelType);
    
    // 3. Prepare metadata (always include the UI channel type)
    let metadataObj: Record<string, any> = {};
    
    // If there's existing metadata, start with that
    if (channel.metadata && typeof channel.metadata === 'object') {
      metadataObj = { ...channel.metadata as Record<string, any> };
    }
    
    // Always ensure the ui_channel_type is stored in metadata
    metadataObj.ui_channel_type = uiChannelType;
    console.log("Final metadata for update:", metadataObj);
    
    // 4. Prepare the update data
    // We need to explicitly pull out the properties we want to update
    // to avoid sending extra properties that don't exist in the database
    const updateData = {
      channel_title: channel.channel_title,
      channel_url: channel.channel_url,
      description: channel.description,
      screenshot_url: channel.screenshot_url,
      total_subscribers: channel.total_subscribers,
      total_views: channel.total_views, 
      start_date: channel.start_date,
      video_count: channel.video_count,
      channel_type: dbChannelType,  // Use the mapped DB channel type
      channel_category: channel.channel_category,
      uses_ai: channel.uses_ai,
      cpm: channel.cpm,
      potential_revenue: potentialRevenue,
      revenue_per_video: revenuePerVideo,
      revenue_per_month: revenuePerMonth,
      country: channel.country,
      niche: channel.niche,
      notes: channel.notes,
      video_id: channel.video_id,
      keywords: channel.keywords,
      metadata: metadataObj  // Include the prepared metadata
    };
    
    console.log("Final update data:", updateData);
    
    // 5. Perform the update
    const { error } = await supabase
      .from("youtube_channels")
      .update(updateData)
      .eq("id", channel.id);
    
    if (error) {
      console.error("Error updating channel:", error);
      toast.error(`Failed to update ${channel.channel_title}: ${error.message}`);
      return false;
    }
    
    console.log(`Channel "${channel.channel_title}" updated successfully`);
    return true;
  } catch (error) {
    console.error("Exception in updateChannel:", error);
    toast.error(`Error updating channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

/**
 * Delete a channel from the database
 */
export const deleteChannel = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("youtube_channels")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting channel:", error);
      toast.error(`Failed to delete channel: ${error.message}`);
      return false;
    }
    
    toast.success("Channel deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception in deleteChannel:", error);
    toast.error(`Error deleting channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

/**
 * Generate content for a channel using AI
 */
export const generateChannelContent = async (channel: Channel): Promise<string | null> => {
  try {
    toast.info("Generating channel description...");
    
    const response = await fetch("https://dhbuaffdzhjzsqjfkesg.supabase.co/functions/v1/generate-channel-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass authentication token if available
        ...(supabase.auth.getSession() ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {})
      },
      body: JSON.stringify({
        channelTitle: channel.channel_title,
        channelType: channel.channel_type,
        channelCategory: channel.channel_category,
        subscribers: channel.total_subscribers,
        views: channel.total_views,
        startDate: channel.start_date,
        videoCount: channel.video_count,
        country: channel.country,
        niche: channel.niche,
        usesAI: channel.uses_ai
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.description) {
      toast.success("Description generated successfully!");
      return data.description;
    } else {
      throw new Error("No description was generated");
    }
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'API error'}`);
    return null;
  }
};

/**
 * Helper function to calculate revenue per month
 */
const calculateRevenuePerMonth = (totalViews: number | null, cpm: number | null, startDate: string | null): number | null => {
  if (!totalViews || !startDate || !cpm) return null;
  
  // Calculate months since channel started
  const start = new Date(startDate);
  const now = new Date();
  const monthsActive = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  
  if (monthsActive <= 0) return null;
  
  // Calculate average views per month
  const viewsPerMonth = totalViews / monthsActive;
  
  // Calculate revenue per month
  return (viewsPerMonth * cpm) / 1000;
};
