
import { 
  ensureStorageBucket, 
  generateScreenshotFilename 
} from "../_shared/screenshot-utils.ts";
import { takeScreenshotViaAPI } from "./screenshot-api.ts";
import { 
  uploadScreenshot, 
  getPublicUrl, 
  updateChannelWithScreenshotUrl 
} from "./storage-operations.ts";

export interface ScreenshotResult {
  success: boolean;
  screenshotUrl?: string;
  error?: string;
  message?: string;
  warning?: string;
}

export async function handleScreenshot(
  supabase: any, 
  channelId: string, 
  channelUrl: string
): Promise<ScreenshotResult> {
  try {
    console.log(`Taking screenshot of channel: ${channelUrl} with ID: ${channelId}`);
    
    const bucketName = "channel_screenshots";
    
    // Ensure the bucket exists
    const bucketResult = await ensureStorageBucket(supabase, bucketName);
    if (!bucketResult.success) {
      return { success: false, error: bucketResult.error };
    }
    
    // Get actual screenshot from screenshotapi.net
    const screenshotBuffer = await takeScreenshotViaAPI(channelUrl);
    if (!screenshotBuffer) {
      return { success: false, error: "Failed to generate screenshot" };
    }
    
    // Generate filename
    const filename = generateScreenshotFilename(channelId);
    
    // Upload the screenshot to Supabase Storage
    const uploadResult = await uploadScreenshot(
      supabase, 
      bucketName, 
      filename, 
      screenshotBuffer
    );
    
    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error };
    }
    
    // Get the public URL of the uploaded screenshot
    const urlResult = await getPublicUrl(supabase, bucketName, filename);
    if (!urlResult.url) {
      return { success: false, error: urlResult.error || "Failed to get public URL" };
    }
    
    const screenshotUrl = urlResult.url;
    
    // Update the channel record with the screenshot URL
    const updateResult = await updateChannelWithScreenshotUrl(
      supabase, 
      channelId, 
      screenshotUrl
    );
    
    if (!updateResult.success) {
      // Still return the URL even if updating the channel failed
      return { 
        success: true, 
        screenshotUrl: screenshotUrl,
        warning: updateResult.error,
        message: "Screenshot taken but channel update failed" 
      };
    }
    
    console.log(`Screenshot saved and channel updated: ${screenshotUrl}`);
    
    return { 
      success: true, 
      screenshotUrl: screenshotUrl,
      message: "Screenshot taken and saved successfully" 
    };
  } catch (error) {
    console.error("Error in handleScreenshot:", error);
    return { 
      success: false,
      error: error.message || "An error occurred while taking the screenshot",
    };
  }
}
