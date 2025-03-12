
import { supabase } from "@/integrations/supabase/client";
import type { ChannelForScreenshotUpdate } from "./screenshotChannelService";

export interface ScreenshotUpdateResult {
  success: boolean;
  message: string;
  screenshotUrl?: string;
}

/**
 * Updates the screenshot for a specific channel
 */
export const updateScreenshotForChannel = async (
  channelId: string, 
  channelUrl: string, 
  channelTitle: string
): Promise<ScreenshotUpdateResult> => {
  try {
    console.log(`Taking screenshot for channel: ${channelTitle} (${channelUrl})`);
    
    const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
      body: { 
        channelId,
        channelUrl
      }
    });
    
    if (error) {
      console.error(`Error taking screenshot for ${channelTitle}:`, error);
      return { 
        success: false, 
        message: `Failed to take screenshot for ${channelTitle}: ${error.message}`
      };
    }
    
    if (!data || !data.success) {
      console.error(`Failed to take screenshot for ${channelTitle}:`, data?.error || "Unknown error");
      return { 
        success: false, 
        message: `Failed to take screenshot for ${channelTitle}: ${data?.error || "Unknown error"}`
      };
    }
    
    console.log(`Successfully took screenshot for ${channelTitle}: ${data.screenshotUrl}`);
    return { 
      success: true, 
      message: `Successfully took screenshot for ${channelTitle}`,
      screenshotUrl: data.screenshotUrl
    };
  } catch (error) {
    console.error(`Exception when taking screenshot for ${channelTitle}:`, error);
    return { 
      success: false, 
      message: `Error taking screenshot for ${channelTitle}: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
};
