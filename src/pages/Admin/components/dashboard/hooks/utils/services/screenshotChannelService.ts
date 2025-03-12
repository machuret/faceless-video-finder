
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
    // Always use the edge function to bypass RLS issues
    const { data: countData, error: countError } = await supabase.functions.invoke('get-public-channels', {
      body: { 
        countOnly: true,
        missingScreenshot: true
      }
    });
    
    if (countError) {
      console.error("Error fetching count of channels without screenshots:", countError);
      throw new Error(`Error fetching count: ${countError.message}`);
    }
    
    const count = countData?.totalCount || 0;
    console.log(`Found ${count} channels missing screenshots (count via edge function)`);
    
    if (count === 0) {
      return { channels: [], count: 0 };
    }
    
    // Now fetch the actual channel data
    const { data: channelsData, error: channelsError } = await supabase.functions.invoke('get-public-channels', {
      body: { 
        limit: 100, // Increase limit to process more channels
        offset: 0,
        missingScreenshot: true
      }
    });
    
    if (channelsError) {
      console.error("Error fetching channels missing screenshots:", channelsError);
      throw new Error(`Error fetching channels: ${channelsError.message}`);
    }
    
    const channels = channelsData?.channels || [];
    console.log(`Fetched ${channels.length} channels missing screenshots (via edge function)`);
    
    return { channels, count };
  } catch (error) {
    console.error("Error fetching channels for screenshot update:", error);
    throw error; // Re-throw to handle in caller
  }
};
