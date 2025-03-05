
// Functions for handling Supabase storage operations

/**
 * Uploads a screenshot to Supabase storage
 */
export async function uploadScreenshot(
  supabase: any,
  bucketName: string,
  filename: string,
  screenshotBuffer: ArrayBuffer
): Promise<{ success: boolean; error?: string; uploadData?: any }> {
  try {
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
    
    return {
      success: true,
      uploadData
    };
  } catch (error) {
    console.error("Error in uploadScreenshot:", error);
    return {
      success: false,
      error: error.message || "An error occurred while uploading the screenshot"
    };
  }
}

/**
 * Gets the public URL for an uploaded file
 */
export async function getPublicUrl(
  supabase: any,
  bucketName: string,
  filename: string
): Promise<{ url: string; error?: string }> {
  try {
    console.log("Getting public URL for screenshot");
    
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);
    
    const screenshotUrl = urlData.publicUrl;
    console.log("Screenshot URL:", screenshotUrl);
    
    return { url: screenshotUrl };
  } catch (error) {
    console.error("Error getting public URL:", error);
    return {
      url: "",
      error: error.message || "An error occurred while getting the public URL"
    };
  }
}

/**
 * Updates the channel record with the screenshot URL
 */
export async function updateChannelWithScreenshotUrl(
  supabase: any,
  channelId: string,
  screenshotUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Updating the channel record with the screenshot URL");
    
    const { error: updateError } = await supabase
      .from("youtube_channels")
      .update({ screenshot_url: screenshotUrl })
      .eq("id", channelId);
    
    if (updateError) {
      console.error("Error updating channel with screenshot URL:", updateError);
      return { 
        success: false, 
        error: `Channel update failed: ${updateError.message}`
      };
    }
    
    console.log(`Channel updated with screenshot URL: ${screenshotUrl}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating channel:", error);
    return {
      success: false,
      error: error.message || "An error occurred while updating the channel"
    };
  }
}
