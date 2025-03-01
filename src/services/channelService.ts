
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
    
    // Post-process the data to ensure custom channel types are handled correctly
    const processedData = data?.map(channel => {
      // Default to the database channel type (which is always one of the valid enum values)
      let displayChannelType: string = channel.channel_type as string;
      
      // If there's metadata with ui_channel_type, use that instead for display purposes
      if (channel.metadata && typeof channel.metadata === 'object' && 'ui_channel_type' in channel.metadata) {
        displayChannelType = channel.metadata.ui_channel_type as string;
        console.log(`Using ui_channel_type from metadata for ${channel.channel_title}: ${displayChannelType}`);
      }
      
      return {
        ...channel,
        channel_type: displayChannelType
      };
    }) || [];
    
    return processedData as Channel[];
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
 * Update a channel in the database, including metadata for custom channel types
 */
export const updateChannel = async (channel: Channel): Promise<boolean> => {
  console.log("=== STARTING CHANNEL UPDATE ===");
  console.log("Input channel data:", JSON.stringify(channel, null, 2));
  
  try {
    // 1. Calculate revenue metrics
    const potentialRevenue = calculatePotentialRevenue(channel.total_views, channel.cpm);
    const revenuePerVideo = calculateRevenuePerVideo(channel.total_views, channel.cpm, channel.video_count);
    const revenuePerMonth = calculateRevenuePerMonth(channel.total_views, channel.cpm, channel.start_date);
    
    // 2. Process the UI channel type
    // Get the UI channel type (what should be stored in metadata)
    // First check if metadata already contains ui_channel_type
    const uiChannelType = channel.metadata?.ui_channel_type || channel.channel_type || "other";
    
    // Determine the database channel type (must be one of the enum values)
    let dbChannelType: DatabaseChannelType;
    if (uiChannelType === "creator" || uiChannelType === "brand" || uiChannelType === "media") {
      dbChannelType = uiChannelType as DatabaseChannelType;
    } else {
      dbChannelType = "other";
    }
    
    console.log(`Channel type mapping: UI="${uiChannelType}" -> DB="${dbChannelType}"`);
    
    // 3. Prepare metadata (always include the UI channel type)
    // Create a new object to avoid mutation
    let metadataObj: Record<string, any> = {};
    
    // If there's existing metadata, start with that
    if (channel.metadata && typeof channel.metadata === 'object') {
      metadataObj = { ...channel.metadata };
    }
    
    // Always set the ui_channel_type in metadata
    metadataObj = {
      ...metadataObj,
      ui_channel_type: uiChannelType
    };
    
    console.log("Prepared metadata:", JSON.stringify(metadataObj, null, 2));
    
    // 4. Prepare data for update
    const updateData = {
      channel_title: channel.channel_title,
      channel_url: channel.channel_url,
      description: channel.description,
      channel_category: channel.channel_category,
      channel_type: dbChannelType,
      screenshot_url: channel.screenshot_url,
      total_subscribers: channel.total_subscribers ? Number(channel.total_subscribers) : null,
      total_views: channel.total_views ? Number(channel.total_views) : null,
      start_date: channel.start_date,
      video_count: channel.video_count ? Number(channel.video_count) : null,
      cpm: channel.cpm ? Number(channel.cpm) : null,
      uses_ai: channel.uses_ai,
      potential_revenue: potentialRevenue,
      revenue_per_video: revenuePerVideo,
      revenue_per_month: revenuePerMonth,
      country: channel.country,
      niche: channel.niche,
      notes: channel.notes,
      video_id: channel.video_id,
      keywords: channel.keywords,
      metadata: metadataObj
    };
    
    console.log("Update data prepared:", JSON.stringify(updateData, null, 2));
    
    // 5. First, check if the channel exists
    const { data: existingChannel, error: checkError } = await supabase
      .from("youtube_channels")
      .select("id")
      .eq("id", channel.id)
      .single();
    
    if (checkError) {
      console.error("Channel existence check failed:", checkError);
      return false;
    }
    
    if (!existingChannel) {
      console.error("Channel not found:", channel.id);
      return false;
    }
    
    // 6. Perform the update
    console.log("Updating channel with ID:", channel.id);
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update(updateData)
      .eq("id", channel.id);
    
    if (updateError) {
      console.error("Channel update failed:", updateError);
      return false;
    }
    
    // 7. Verify the update was successful
    console.log("Verifying update...");
    const { data: updatedChannel, error: verifyError } = await supabase
      .from("youtube_channels")
      .select("id, channel_title, channel_type, metadata")
      .eq("id", channel.id)
      .single();
    
    if (verifyError) {
      console.error("Update verification failed:", verifyError);
      return false;
    }
    
    console.log("Channel updated successfully:");
    console.log("Updated channel data:", JSON.stringify(updatedChannel, null, 2));
    
    return true;
  } catch (error) {
    console.error("=== CHANNEL UPDATE ERROR ===");
    console.error("Error details:", error);
    return false;
  }
};
