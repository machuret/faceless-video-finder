
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
    console.log("Saving channel with data:", channel);
    
    const potentialRevenue = calculatePotentialRevenue(channel.total_views, channel.cpm);
    const revenuePerVideo = calculateRevenuePerVideo(channel.total_views, channel.cpm, channel.video_count);
    const revenuePerMonth = calculateRevenuePerMonth(channel.total_views, channel.cpm, channel.start_date);

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
    
    // If we have a UI channel type that's not a database type, save it in metadata
    if (uiChannelType && !["creator", "brand", "media", "other"].includes(uiChannelType)) {
      metadata.ui_channel_type = uiChannelType;
    }
    
    console.log(`Mapping channel_type from "${uiChannelType}" to database type "${dbChannelType}"`);
    console.log("Metadata:", metadata);

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

    // Remove videoStats before sending to Supabase
    const { videoStats, ...dataToSend } = dataToUpdate as any;
    
    console.log("Data being sent to Supabase:", dataToSend);

    const { error } = await supabase
      .from("youtube_channels")
      .update(dataToSend)
      .eq("id", channel.id);

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    toast.success("Channel updated successfully");
    return true;
  } catch (error) {
    console.error("Save error:", error);
    toast.error("Failed to update channel");
    return false;
  }
};
