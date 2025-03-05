
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

// Take screenshot using screenshotapi.net with YouTube-specific cookie bypass
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
    const delay = 7000; // Increase delay to 7 seconds to ensure page and dialogs fully load
    const fullPage = false; // Get only the first viewport
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"; // Updated Chrome user agent
    const acceptCookies = true; // Auto-accept cookies
    const width = 1366; // Common desktop width
    const height = 768; // Common desktop height
    
    // YouTube-specific script to handle cookie consent dialog
    // This targets the exact selector pattern used by YouTube's cookie consent dialog
    const script = encodeURIComponent(`
      function clickConsentButton() {
        console.log("Looking for YouTube consent buttons...");
        
        // YouTube's "Accept all" button - multiple approaches
        const selectors = [
          // Primary approach - most specific to YouTube
          'button[aria-label="Accept all"]',
          'button[data-style="accept-all"]',
          'form button.VfPpkd-LgbsSe:first-child',
          
          // Secondary approaches - more generic
          'button:contains("Accept all")',
          'button.yt-spec-button-shape-next--filled',
          
          // Fallbacks for different languages/variations
          'button:contains("I Agree")',
          'button:contains("Accept")',
          'button:contains("Agree")',
          'button[data-testid="cookie-policy-dialog-accept-button"]',
          '.consent-bump-dialog button:first-of-type'
        ];
        
        let buttonFound = false;
        
        for (const selector of selectors) {
          const buttons = document.querySelectorAll(selector);
          console.log(\`Found \${buttons.length} buttons with selector: \${selector}\`);
          
          if (buttons.length > 0) {
            for (const button of buttons) {
              console.log("Clicking button:", button);
              button.click();
              buttonFound = true;
            }
            if (buttonFound) break;
          }
        }
        
        if (!buttonFound) {
          console.log("No consent buttons found, trying dialog approach");
          
          // Try to find and handle any dialog element
          const dialogs = document.querySelectorAll('div[role="dialog"]');
          if (dialogs.length > 0) {
            for (const dialog of dialogs) {
              const acceptButtons = dialog.querySelectorAll('button');
              for (const button of acceptButtons) {
                // Check if button text contains accept-related words
                const text = button.textContent.toLowerCase();
                if (text.includes('accept') || text.includes('agree') || text.includes('ok') || text.includes('yes')) {
                  console.log("Clicking dialog button:", button);
                  button.click();
                  buttonFound = true;
                  break;
                }
              }
              if (buttonFound) break;
            }
          }
        }
        
        return buttonFound;
      }
      
      // Try multiple times with delays
      setTimeout(() => {
        if (!clickConsentButton()) {
          console.log("First attempt failed, trying again...");
          setTimeout(() => {
            clickConsentButton();
          }, 1500);
        }
      }, 2000);
    `);
    
    // Try to optimize the URL to target channel page specifically
    let optimizedUrl = url;
    if (url.includes("youtube.com/channel/") || url.includes("youtube.com/c/") || url.includes("youtube.com/@")) {
      // Add /featured to go directly to channel homepage
      if (!url.endsWith("/")) {
        optimizedUrl = url + "/featured";
      } else {
        optimizedUrl = url + "featured";
      }
      console.log("Optimized URL for screenshot:", optimizedUrl);
    }
    
    const encodedOptimizedUrl = encodeURIComponent(optimizedUrl);
    
    // Construct the API URL with all enhanced parameters
    const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodedOptimizedUrl}&output=${output}&file_type=${fileType}&delay=${delay}&full_page=${fullPage}&user_agent=${encodeURIComponent(userAgent)}&accept_cookies=${acceptCookies}&width=${width}&height=${height}&script=${script}`;
    
    console.log("Calling screenshot API with YouTube-specific cookie handling");
    
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
