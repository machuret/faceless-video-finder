
import { 
  ensureStorageBucket, 
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
    
    // Get actual screenshot from screenshotapi.net
    const screenshotBuffer = await takeScreenshotViaAPI(channelUrl);
    if (!screenshotBuffer) {
      return { success: false, error: "Failed to generate screenshot" };
    }
    
    // Generate filename
    const filename = generateScreenshotFilename(channelId);
    
    console.log(`Uploading screenshot with filename: ${filename}`);
    // Upload the screenshot to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, screenshotBuffer, {
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

// Take screenshot using screenshotapi.net
async function takeScreenshotViaAPI(url: string): Promise<ArrayBuffer | null> {
  try {
    console.log("Taking screenshot via screenshotapi.net:", url);
    
    // Get API key from environment
    const apiKey = Deno.env.get("SCREENSHOT_API_KEY");
    if (!apiKey) {
      console.error("SCREENSHOT_API_KEY not configured");
      throw new Error("Screenshot API key not configured");
    }
    
    // Prepare the API request
    const encodedUrl = encodeURIComponent(url);
    const output = "image";
    const fileType = "png";
    
    const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodedUrl}&output=${output}&file_type=${fileType}`;
    
    console.log("Calling screenshot API:", apiUrl);
    
    // Make the request to the screenshot API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error("Screenshot API error:", response.status, response.statusText);
      throw new Error(`Screenshot API returned ${response.status}: ${response.statusText}`);
    }
    
    console.log("Screenshot API response received");
    return await response.arrayBuffer();
  } catch (err) {
    console.error("Error taking screenshot via API:", err);
    return null;
  }
}
