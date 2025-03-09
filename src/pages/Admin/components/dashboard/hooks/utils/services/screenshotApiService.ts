
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for interacting with screenshot API
 */
export const screenshotApiService = {
  /**
   * Fetches channels without screenshots
   */
  async fetchChannelsWithoutScreenshots(): Promise<{ 
    channels: ChannelForScreenshot[], 
    count: number 
  }> {
    try {
      const { data, error, count } = await supabase
        .from('youtube_channels')
        .select('id, channel_url, channel_title', { count: 'exact' })
        .is('screenshot_url', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log(`Found ${count || 0} channels without screenshots`);
      console.log("Sample channels:", data?.slice(0, 3));
      return { channels: data || [], count: count || 0 };
    } catch (error) {
      console.error("Error fetching channels without screenshots:", error);
      return { channels: [], count: 0 };
    }
  },

  /**
   * Updates screenshot for a channel
   */
  async updateScreenshot(channel: ChannelForScreenshot): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    try {
      console.log(`Processing channel ${channel.id}: ${channel.channel_title}`);
      console.log(`Updating screenshot for channel ${channel.id}: ${channel.channel_url} (${channel.channel_title})`);
      
      // Add timeout for the fetch operation to prevent hanging
      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: { channelId: channel.id, channelUrl: channel.channel_url }
      });

      if (error) {
        console.error(`Error updating screenshot for channel ${channel.id}:`, error);
        return { success: false, message: error.message };
      }

      if (!data?.success) {
        console.error(`Failed to update screenshot for channel ${channel.id}:`, data?.error || "Unknown error");
        return { success: false, message: data?.error || "Unknown error" };
      }

      console.log(`Successfully updated screenshot for channel ${channel.id}`);
      return { success: true, message: `Updated screenshot for ${channel.channel_title || "channel"}` };
    } catch (error) {
      // Check if this is an abort error (timeout)
      if (error.name === 'AbortError') {
        const message = `Timeout waiting for Apify run to complete`;
        console.error(`Failed to update screenshot for channel ${channel.id}:`, message);
        return { success: false, message };
      }
      
      console.error(`Error updating screenshot for channel ${channel.id}:`, error);
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }
};

export interface ChannelForScreenshot {
  id: string;
  channel_url: string;
  channel_title: string | null;
}
