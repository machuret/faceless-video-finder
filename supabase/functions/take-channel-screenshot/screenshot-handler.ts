
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

// Take screenshot using screenshotapi.net with stronger cookie bypass methods
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
    
    // Enhanced parameters to bypass cookie consent popups and delayed loading
    const delay = 5000; // Increase delay to 5 seconds to ensure page fully loads
    const fullPage = false; // Get only the first viewport
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36"; // Updated Chrome user agent
    const acceptCookies = true; // Auto-accept cookies
    const width = 1280; // Set a standard desktop width
    const height = 800; // Set a standard desktop height
    
    // Additional script to auto-accept cookie consent
    const script = encodeURIComponent(`
      // Wait for consent dialog
      setTimeout(() => {
        // Try to click common cookie consent buttons
        const consentButtons = document.querySelectorAll('button[aria-label*="Accept"], button[aria-label*="Agree"], button[aria-label*="accept"], button[aria-label*="agree"], button:contains("Accept"), button:contains("I agree"), .accept-cookies-button');
        if (consentButtons.length > 0) {
          for (let button of consentButtons) {
            button.click();
          }
        }
      }, 2000);
    `);
    
    // Try to optimize the URL to target channel page specifically
    let optimizedUrl = url;
    if (url.includes("youtube.com/channel/") || url.includes("youtube.com/c/")) {
      // Add /featured to go directly to channel homepage, avoiding some consent screens
      if (!url.endsWith("/")) {
        optimizedUrl = url + "/featured";
      } else {
        optimizedUrl = url + "featured";
      }
    }
    
    console.log("Using optimized URL for screenshot:", optimizedUrl);
    const encodedOptimizedUrl = encodeURIComponent(optimizedUrl);
    
    // Construct the API URL with all enhanced parameters
    const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodedOptimizedUrl}&output=${output}&file_type=${fileType}&delay=${delay}&full_page=${fullPage}&user_agent=${encodeURIComponent(userAgent)}&accept_cookies=${acceptCookies}&width=${width}&height=${height}&script=${script}`;
    
    console.log("Calling screenshot API with enhanced parameters");
    
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
