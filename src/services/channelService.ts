
import { supabase } from "@/integrations/supabase/client";
import type { Channel, DatabaseChannelType } from "@/types/youtube";
import { toast } from "sonner";
import { calculatePotentialRevenue, calculateRevenuePerVideo, calculateRevenuePerMonth } from "@/utils/revenueCalculations";

/**
 * Fetch all channels from the database
 */
export const fetchAllChannels = async (): Promise<Channel[]> => {
  try {
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Channel[] || [];
  } catch (error) {
    console.error("Error fetching channels:", error);
    toast.error("Failed to fetch channels");
    return [];
  }
};

/**
 * Delete a channel by ID
 */
export const deleteChannel = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("youtube_channels")
      .delete()
      .eq("id", id);

    if (error) throw error;
    toast.success("Channel deleted successfully");
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete channel");
    return false;
  }
};

/**
 * Generate content for a channel using AI
 */
export const generateChannelContent = async (channel: Channel): Promise<string | null> => {
  try {
    console.log('Calling generate-channel-content for:', channel.channel_title);
    
    const { data, error } = await supabase.functions.invoke('generate-channel-content', {
      body: { channelTitle: channel.channel_title }
    });

    if (error) throw error;

    if (!data || !data.description) {
      throw new Error('Failed to generate valid content');
    }

    const { error: updateError } = await supabase
      .from('youtube_channels')
      .update({ description: data.description })
      .eq('id', channel.id);

    if (updateError) throw updateError;

    toast.success('Channel description updated successfully');
    return data.description;
  } catch (error) {
    console.error('Generate content error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    return null;
  }
};

/**
 * Update a channel in the database
 */
export const updateChannel = async (channel: Channel): Promise<boolean> => {
  try {
    console.log("=== CHANNEL UPDATE START ===");
    console.log("Channel data received:", JSON.stringify(channel, null, 2));
    
    // Calculate revenue metrics
    const potentialRevenue = calculatePotentialRevenue(channel.total_views, channel.cpm);
    const revenuePerVideo = calculateRevenuePerVideo(channel.total_views, channel.cpm, channel.video_count);
    const revenuePerMonth = calculateRevenuePerMonth(channel.total_views, channel.cpm, channel.start_date);
    
    console.log("Revenue calculations:", {
      potentialRevenue,
      revenuePerVideo,
      revenuePerMonth,
      baseValues: {
        views: channel.total_views,
        cpm: channel.cpm,
        videoCount: channel.video_count,
        startDate: channel.start_date
      }
    });

    // Process the UI channel type
    let uiChannelType = channel.channel_type;
    let dbChannelType: DatabaseChannelType = "other";
    
    // If it's one of the database types, use it directly
    if (uiChannelType === "creator" || uiChannelType === "brand" || uiChannelType === "media") {
      dbChannelType = uiChannelType as DatabaseChannelType;
    } else {
      // Store the UI type in metadata
      dbChannelType = "other";
    }

    // Get or initialize metadata
    const metadata = channel.metadata || {};
    
    // Always store the UI channel type in metadata for consistency
    metadata.ui_channel_type = uiChannelType;
    
    console.log(`Channel type mapping: "${uiChannelType}" -> database type "${dbChannelType}"`);
    console.log("Updated metadata:", JSON.stringify(metadata, null, 2));

    // Make sure the channel data is properly typed
    const dataToUpdate = {
      ...channel,
      channel_type: dbChannelType,
      metadata: metadata,
      potential_revenue: potentialRevenue,
      revenue_per_video: revenuePerVideo,
      revenue_per_month: revenuePerMonth,
      total_views: channel.total_views ? Number(channel.total_views) : null,
      total_subscribers: channel.total_subscribers ? Number(channel.total_subscribers) : null,
      video_count: channel.video_count ? Number(channel.video_count) : null,
      cpm: channel.cpm ? Number(channel.cpm) : null,
    };

    // Remove videoStats before sending to Supabase as it's not a column in the database
    const { videoStats, ...dataToSend } = dataToUpdate as any;
    
    // Check for any other properties that might not be columns in the database
    const validFields = [
      'id', 'channel_title', 'channel_url', 'description', 'channel_category', 
      'channel_type', 'metadata', 'screenshot_url', 'total_subscribers', 
      'total_views', 'start_date', 'video_count', 'cpm', 'uses_ai', 'potential_revenue', 
      'revenue_per_video', 'revenue_per_month', 'country', 'niche', 'notes'
    ];
    
    // Create a clean object with only valid database fields
    const cleanDataToSend = Object.keys(dataToSend)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = dataToSend[key];
        return obj;
      }, {} as any);
    
    console.log("Filtered data being sent to Supabase:", JSON.stringify(cleanDataToSend, null, 2));

    // Perform the update
    const { data, error } = await supabase
      .from("youtube_channels")
      .update(cleanDataToSend)
      .eq("id", channel.id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    console.log("Update successful, returned data:", data);
    console.log("=== CHANNEL UPDATE END ===");
    
    toast.success("Channel updated successfully");
    return true;
  } catch (error) {
    console.error("=== CHANNEL UPDATE ERROR ===");
    console.error("Error details:", error);
    
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    if ('code' in (error as any)) {
      console.error("Error code:", (error as any).code);
    }
    
    if ('details' in (error as any)) {
      console.error("Error details:", (error as any).details);
    }
    
    if ('hint' in (error as any)) {
      console.error("Error hint:", (error as any).hint);
    }
    
    toast.error(`Failed to update channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};
