
import { supabase } from "@/integrations/supabase/client";

export interface ChannelForUpdate {
  id: string;
  channel_url: string;
  channel_title: string | null;
}

export interface StatsUpdateResult {
  success: boolean;
  message: string;
}

export const fetchChannelsForStatsUpdate = async (): Promise<{ channels: ChannelForUpdate[], count: number }> => {
  try {
    // Improved query to find channels missing any of the important stats
    const { data, error, count } = await supabase
      .from('youtube_channels')
      .select('id, channel_url, channel_title', { count: 'exact' })
      .or('total_subscribers.is.null,total_views.is.null,video_count.is.null,description.is.null')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    console.log(`Found ${count || 0} channels missing stats`);
    console.log("Sample channels with missing stats:", data?.slice(0, 3));
    return { channels: data || [], count: count || 0 };
  } catch (error) {
    console.error("Error fetching channels for stats update:", error);
    return { channels: [], count: 0 };
  }
};

export const updateStatsForChannel = async (
  channelId: string, 
  channelUrl: string, 
  channelTitle: string
): Promise<StatsUpdateResult> => {
  try {
    console.log(`Fetching stats for channel: ${channelTitle} (${channelUrl})`);
    
    const { data, error } = await supabase.functions.invoke<any>('fetch-channel-stats-apify', {
      body: { channelUrl }
    });

    if (error) {
      console.error(`Error fetching stats for ${channelTitle}:`, error);
      return { 
        success: false, 
        message: `Failed to fetch stats for ${channelTitle}: ${error.message}`
      };
    }

    if (!data || !data.success) {
      console.error(`Failed to fetch stats for ${channelTitle}:`, data?.error || "Unknown error");
      return { 
        success: false, 
        message: `Failed to fetch stats for ${channelTitle}: ${data?.error || "Unknown error"}`
      };
    }

    console.log(`Received stats for ${channelTitle}:`, data);

    // Prepare data for update
    const updateData: Record<string, any> = {};
    
    if (data.title) updateData.channel_title = data.title;
    if (data.subscriberCount !== undefined) updateData.total_subscribers = data.subscriberCount;
    if (data.viewCount !== undefined) updateData.total_views = data.viewCount;
    if (data.videoCount !== undefined) updateData.video_count = data.videoCount;
    if (data.startDate) updateData.start_date = data.startDate;
    if (data.description) updateData.description = data.description;
    if (data.country) updateData.country = data.country;
    
    console.log(`Update data prepared for ${channelTitle}:`, updateData);
    
    // Only update if we have data to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('youtube_channels')
        .update(updateData)
        .eq('id', channelId);

      if (updateError) {
        console.error(`Error updating stats for ${channelTitle}:`, updateError);
        return { 
          success: false, 
          message: `Error updating stats for ${channelTitle}: ${updateError.message}`
        };
      }
      
      console.log(`Successfully updated stats for ${channelTitle}`);
      return { 
        success: true, 
        message: `Successfully updated stats for ${channelTitle}`
      };
    }
    
    return { 
      success: false, 
      message: `No valid data received for ${channelTitle}`
    };
  } catch (error) {
    console.error(`Exception when updating stats for ${channelTitle}:`, error);
    return { 
      success: false, 
      message: `Error updating stats for ${channelTitle}: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
};
