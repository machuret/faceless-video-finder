
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
      let displayChannelType = channel.channel_type;
      
      // If there's metadata with ui_channel_type, use that instead
      if (channel.metadata && channel.metadata.ui_channel_type) {
        displayChannelType = channel.metadata.ui_channel_type;
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
  try {
    console.log("=== CHANNEL UPDATE START ===");
    console.log("Channel data received:", JSON.stringify(channel, null, 2));
    
    // Calculate revenue metrics
    const potentialRevenue = calculatePotentialRevenue(channel.total_views, channel.cpm);
    const revenuePerVideo = calculateRevenuePerVideo(channel.total_views, channel.cpm, channel.video_count);
    const revenuePerMonth = calculateRevenuePerMonth(channel.total_views, channel.cpm, channel.start_date);
    
    // Process the UI channel type
    const uiChannelType = channel.channel_type;
    let dbChannelType: DatabaseChannelType = "other";
    
    // If it's one of the database types, use it directly
    if (uiChannelType === "creator" || uiChannelType === "brand" || uiChannelType === "media") {
      dbChannelType = uiChannelType as DatabaseChannelType;
    } else {
      // For custom types, store as "other" in the main column
      dbChannelType = "other";
    }
    
    console.log(`Channel type mapping: UI="${uiChannelType}" -> DB="${dbChannelType}"`);
    
    // Prepare the data for update
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
      video_id: channel.video_id
    };
    
    // First update the main channel data
    console.log("Updating standard fields with:", JSON.stringify(updateData, null, 2));
    
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update(updateData)
      .eq("id", channel.id);
    
    if (updateError) {
      throw updateError;
    }
    
    console.log("Standard fields updated successfully");
    
    // Now update the metadata with the custom channel type, bypassing TypeScript issues
    if (uiChannelType) {
      console.log(`Saving UI channel type "${uiChannelType}" to metadata...`);
      
      // Use the Edge Function to update metadata
      try {
        const updateResult = await fetch(
          "https://dhbuaffdzhjzsqjfkesg.supabase.co/functions/v1/update-channel-metadata",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
            },
            body: JSON.stringify({
              channelId: channel.id,
              metadata: { ui_channel_type: uiChannelType }
            })
          }
        );
        
        const updateJson = await updateResult.json();
        console.log("Metadata update response:", updateJson);
        
        if (!updateResult.ok) {
          console.error("Failed to update metadata:", updateJson);
        } else {
          console.log("Successfully updated metadata with UI channel type");
        }
      } catch (metadataError) {
        console.error("Error updating metadata:", metadataError);
        // Continue since we've already updated the main fields
      }
    }
    
    console.log("=== CHANNEL UPDATE END ===");
    toast.success("Channel updated successfully");
    
    return true;
  } catch (error) {
    console.error("=== CHANNEL UPDATE ERROR ===");
    console.error("Error details:", error);
    
    // Display more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to update channel: ${errorMessage}`);
    return false;
  }
};
