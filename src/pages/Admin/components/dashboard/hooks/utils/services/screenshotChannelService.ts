
import { supabase } from "@/integrations/supabase/client";

export interface ChannelForScreenshotUpdate {
  id: string;
  channel_url: string;
  channel_title?: string;
}

/**
 * Fetches channels that need screenshot updates
 */
export const fetchChannelsForScreenshotUpdate = async (): Promise<{
  channels: ChannelForScreenshotUpdate[];
  count: number;
}> => {
  try {
    console.log("Fetching channels that need screenshot updates...");
    
    // First try edge function to bypass RLS issues
    try {
      const { data: countData, error: countError } = await supabase.functions.invoke('get-public-channels', {
        body: { 
          countOnly: true,
          missingScreenshot: true
        }
      });
      
      if (countError) {
        console.error("Error fetching count via edge function:", countError);
        throw new Error(`Edge function error: ${countError.message}`);
      }
      
      const count = countData?.totalCount || 0;
      console.log(`Found ${count} channels missing screenshots (count via edge function)`);
      
      if (count === 0) {
        return { channels: [], count: 0 };
      }
      
      // Now fetch the actual channel data
      const { data: channelsData, error: channelsError } = await supabase.functions.invoke('get-public-channels', {
        body: { 
          limit: 100, // Process up to 100 channels at a time
          offset: 0,
          missingScreenshot: true
        }
      });
      
      if (channelsError) {
        console.error("Error fetching channels via edge function:", channelsError);
        throw new Error(`Edge function error: ${channelsError.message}`);
      }
      
      const channels = channelsData?.channels || [];
      console.log(`Fetched ${channels.length} channels missing screenshots (via edge function)`);
      
      return { channels, count };
    } catch (edgeFunctionError) {
      console.warn("Edge function failed, falling back to direct query:", edgeFunctionError);
      
      // Fall back to direct database query if edge function fails
      const { count: countResult, error: countError } = await supabase
        .from('youtube_channels')
        .select('*', { count: 'exact', head: true })
        .is('screenshot_url', null);
      
      if (countError) {
        console.error("Error with fallback count query:", countError);
        throw countError;
      }
      
      const count = countResult || 0;
      console.log(`Found ${count} channels missing screenshots (via direct query)`);
      
      if (count === 0) {
        return { channels: [], count: 0 };
      }
      
      const { data: channels, error: channelsError } = await supabase
        .from('youtube_channels')
        .select('id, channel_url, channel_title')
        .is('screenshot_url', null)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (channelsError) {
        console.error("Error with fallback channels query:", channelsError);
        throw channelsError;
      }
      
      console.log(`Fetched ${channels?.length || 0} channels missing screenshots (via direct query)`);
      
      return { 
        channels: channels || [], 
        count 
      };
    }
  } catch (error) {
    console.error("Final error fetching channels for screenshot update:", error);
    throw error;
  }
};
