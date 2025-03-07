
import { 
  ensureStorageBucket, 
  generateScreenshotFilename,
  APIFY_API_TOKEN 
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
  apifyUrl?: string; // Added to support direct Apify URL as fallback
}

export async function handleScreenshot(
  supabase: any, 
  channelId: string, 
  channelUrl: string
): Promise<ScreenshotResult> {
  try {
    console.log(`Taking screenshot of channel: ${channelUrl} with ID: ${channelId}`);
    
    // Validate inputs
    if (!channelId) {
      return { success: false, error: "Channel ID is required" };
    }
    
    if (!channelUrl) {
      return { success: false, error: "Channel URL is required" };
    }
    
    // Sanitize channel URL to ensure it's valid
    let sanitizedUrl = channelUrl.trim();
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      sanitizedUrl = `https://${sanitizedUrl}`;
    }
    
    // Ensure the URL has a valid domain
    try {
      new URL(sanitizedUrl);
    } catch (e) {
      return { success: false, error: `Invalid URL: ${sanitizedUrl}` };
    }
    
    // Check if it's a YouTube URL or handle, and format it correctly
    let isCustomFormatted = false;
    if (sanitizedUrl.includes('youtube.com/@') || sanitizedUrl.startsWith('https://@')) {
      // It's a YouTube handle
      const handleMatch = sanitizedUrl.match(/@([a-zA-Z0-9_-]+)/);
      if (handleMatch && handleMatch[1]) {
        sanitizedUrl = `https://www.youtube.com/@${handleMatch[1]}`;
        isCustomFormatted = true;
      }
    } else if (!sanitizedUrl.includes('youtube.com') && sanitizedUrl.startsWith('https://@')) {
      // Convert @handle to proper YouTube URL
      const handle = sanitizedUrl.replace('https://@', '');
      sanitizedUrl = `https://www.youtube.com/@${handle}`;
      isCustomFormatted = true;
    } else if (sanitizedUrl.includes('youtube.com/channel/')) {
      // It's a channel ID URL, make sure it's properly formatted
      const channelIdMatch = sanitizedUrl.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      if (channelIdMatch && channelIdMatch[1]) {
        sanitizedUrl = `https://www.youtube.com/channel/${channelIdMatch[1]}`;
      }
    }
    
    console.log(`Using sanitized URL: ${sanitizedUrl} (custom formatted: ${isCustomFormatted})`);
    
    // Direct Apify approach for debugging/fallback
    if (APIFY_API_TOKEN) {
      try {
        console.log("Attempting direct Apify screenshot request...");
        const startResponse = await fetch("https://api.apify.com/v2/actor-tasks/xPTZ2w3ZjmfnmHE8R/run-sync?token=" + APIFY_API_TOKEN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startUrls: [{ url: sanitizedUrl }],
            waitForSelectorOnLoad: "body",
            fullPage: false,
            hideScrollbar: true,
            waitForMillis: 5000,
          }),
        });

        if (startResponse.ok) {
          const responseData = await startResponse.json();
          console.log("Direct Apify response:", JSON.stringify(responseData));
          
          // Try to extract direct screenshot URL from dataset
          if (responseData?.defaultDatasetId) {
            const datasetUrl = `https://api.apify.com/v2/datasets/${responseData.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`;
            const datasetResponse = await fetch(datasetUrl);
            if (datasetResponse.ok) {
              const datasetItems = await datasetResponse.json();
              if (datasetItems.length > 0 && datasetItems[0].screenshotUrl) {
                const directApifyUrl = datasetItems[0].screenshotUrl;
                console.log("Found direct Apify URL:", directApifyUrl);
                
                // Update the channel record with this URL
                const updateResult = await updateChannelWithScreenshotUrl(
                  supabase, 
                  channelId, 
                  directApifyUrl
                );
                
                if (updateResult.success) {
                  return { 
                    success: true, 
                    screenshotUrl: directApifyUrl,
                    apifyUrl: directApifyUrl,
                    message: "Screenshot taken using direct Apify URL"
                  };
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Direct Apify approach failed:", err);
        // Continue with regular flow
      }
    }
    
    const bucketName = "channel_screenshots";
    
    // Ensure the bucket exists
    const bucketResult = await ensureStorageBucket(supabase, bucketName);
    if (!bucketResult.success) {
      return { success: false, error: bucketResult.error };
    }
    
    // Get screenshot from Apify
    console.log("Requesting screenshot from Apify...");
    const screenshotBuffer = await takeScreenshotViaAPI(sanitizedUrl);
    if (!screenshotBuffer) {
      return { 
        success: false, 
        error: "Failed to generate screenshot. Apify API did not return a valid image."
      };
    }
    
    // Check if the screenshot buffer is valid
    if (!screenshotBuffer.byteLength) {
      return { 
        success: false, 
        error: "Generated screenshot is empty or invalid" 
      };
    }
    
    console.log(`Screenshot received: ${screenshotBuffer.byteLength} bytes`);
    
    // Generate filename
    const filename = generateScreenshotFilename(channelId);
    
    // Upload the screenshot to Supabase Storage
    console.log(`Uploading screenshot to bucket ${bucketName} with filename ${filename}...`);
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
    console.log(`Screenshot uploaded with URL: ${screenshotUrl}`);
    
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
