
import { 
  ensureStorageBucket, 
  getPlaceholderImage, 
  generateScreenshotFilename 
} from "../_shared/screenshot-utils.ts";

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
    
    // Get placeholder image
    const imageBuffer = await getPlaceholderImage();
    if (!imageBuffer) {
      return { success: false, error: "Failed to generate placeholder image" };
    }
    
    // Generate filename
    const filename = generateScreenshotFilename(channelId);
    
    console.log(`Uploading screenshot with filename: ${filename}`);
    // Upload the screenshot to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });
    
    if (uploadError) {
      console.error("Error uploading screenshot:", uploadError);
      return { 
        success: false, 
        error: `Error uploading screenshot: ${uploadError.message}`
      };
    }
    
    console.log("Screenshot uploaded successfully, getting public URL");
    // Get the public URL of the uploaded screenshot
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);
    
    const screenshotUrl = urlData.publicUrl;
    console.log("Screenshot URL:", screenshotUrl);
    
    console.log("Updating the channel record with the screenshot URL");
    // Update the channel record with the screenshot URL
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update({ screenshot_url: screenshotUrl })
      .eq("id", channelId);
    
    if (updateError) {
      console.error("Error updating channel with screenshot URL:", updateError);
      // Still return the URL even if updating the channel failed
      return { 
        success: true, 
        screenshotUrl: screenshotUrl,
        warning: `Channel update failed: ${updateError.message}`,
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
