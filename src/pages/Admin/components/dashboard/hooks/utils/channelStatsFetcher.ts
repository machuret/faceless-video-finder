
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

/**
 * Fetches channels for stats update with optimized queries
 */
export const fetchChannelsForStatsUpdate = async (): Promise<{ channels: ChannelForUpdate[], count: number }> => {
  try {
    // Only select the fields we need for the update to optimize the query
    const requiredFields = 'id, channel_url, channel_title';
    
    // More precise query to find channels that are missing important stats
    // Using explicit NULL checks for more accuracy and improved performance
    const { data, error, count } = await supabase
      .from('youtube_channels')
      .select(requiredFields, { count: 'exact' })
      .or('total_subscribers.is.null,total_views.is.null,video_count.is.null,description.is.null')
      .order('updated_at', { ascending: true });
    
    if (error) throw error;
    console.log(`Found ${count || 0} channels missing stats`);
    
    // Log each channel missing stats to help debug
    if (data && data.length > 0) {
      console.log("First 5 channels with missing stats:", data.slice(0, 5));
    }
    
    return { channels: data || [], count: count || 0 };
  } catch (error) {
    console.error("Error fetching channels for stats update:", error);
    return { channels: [], count: 0 };
  }
};

/**
 * Updates stats for a channel with timeout protection
 */
export const updateStatsForChannel = async (
  channelId: string, 
  channelUrl: string, 
  channelTitle: string
): Promise<StatsUpdateResult> => {
  try {
    console.log(`Fetching stats for channel: ${channelTitle} (${channelUrl})`);
    
    // Add timeout for the fetch operation to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Specify the fields we want to fetch to optimize the API call
      const requiredFields = [
        'title',
        'subscriberCount',
        'viewCount',
        'videoCount',
        'startDate',
        'description',
        'country'
      ];
      
      const { data, error } = await supabase.functions.invoke<any>('fetch-channel-stats-apify', {
        body: { 
          channelUrl,
          fields: requiredFields 
        }
      });
      
      clearTimeout(timeoutId);

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

      // Prepare data for update, only including fields that actually have values
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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    // Check if this is an abort error (timeout)
    if (error.name === 'AbortError') {
      console.error(`Timeout when updating stats for ${channelTitle}`);
      return { 
        success: false, 
        message: `Timeout when updating stats for ${channelTitle}`
      };
    }
    
    console.error(`Exception when updating stats for ${channelTitle}:`, error);
    return { 
      success: false, 
      message: `Error updating stats for ${channelTitle}: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
};
