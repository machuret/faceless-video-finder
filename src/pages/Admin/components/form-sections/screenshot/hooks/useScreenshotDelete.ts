
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseScreenshotDeleteProps {
  channelId: string | undefined;
  onScreenshotChange: (url: string) => void;
}

/**
 * Hook for handling screenshot deletion
 */
export const useScreenshotDelete = ({ 
  channelId, 
  onScreenshotChange
}: UseScreenshotDeleteProps) => {
  
  /**
   * Handles the deletion of a screenshot
   */
  const handleDeleteScreenshot = async (screenshotUrl: string) => {
    if (!channelId || !screenshotUrl) {
      toast.error("No screenshot to delete");
      return;
    }
    
    console.log("🔄 Starting screenshot deletion process");
    console.log("🔗 Screenshot URL to delete:", screenshotUrl);
    console.log("📌 Channel ID:", channelId);
    
    try {
      // STEP 1: Update the database first to ensure UI feedback is immediate
      console.log("📝 Updating database to remove screenshot reference");
      const { error: dbError } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: null })
        .eq("id", channelId);
      
      if (dbError) {
        console.error("❌ Database update failed:", dbError);
        toast.error(`Failed to update database: ${dbError.message}`);
        return;
      }
      
      console.log("✅ Database updated successfully");
      
      // Update UI immediately after database update succeeds
      toast.success("Screenshot removed successfully");
      onScreenshotChange("");
      
      // STEP 2: Try to extract file path from URL (non-blocking)
      console.log("🔍 Attempting to extract storage path from URL:", screenshotUrl);
      
      try {
        let filePath = '';
        let bucketName = '';
        
        // Try different URL parsing strategies
        
        // Strategy 1: Standard Supabase URL format
        if (screenshotUrl.includes('/storage/v1/object/public/')) {
          const storagePrefix = '/storage/v1/object/public/';
          const startIndex = screenshotUrl.indexOf(storagePrefix) + storagePrefix.length;
          const pathWithBucket = screenshotUrl.substring(startIndex).split('?')[0];
          
          // First segment is bucket name, rest is file path
          const segments = pathWithBucket.split('/');
          bucketName = segments[0];
          filePath = pathWithBucket.substring(bucketName.length + 1);
          
          console.log("Strategy 1 - Extracted bucket:", bucketName);
          console.log("Strategy 1 - Extracted path:", filePath);
        } 
        // Strategy 2: Direct bucket URL
        else if (screenshotUrl.includes('/channel-screenshots/') || 
                screenshotUrl.includes('/channel_screenshots/')) {
          
          // Determine bucket name from URL
          bucketName = screenshotUrl.includes('/channel-screenshots/') 
            ? 'channel-screenshots' 
            : 'channel_screenshots';
            
          // Extract the file path after the bucket name
          const bucketPrefix = `/${bucketName}/`;
          const startIndex = screenshotUrl.indexOf(bucketPrefix) + bucketPrefix.length;
          filePath = screenshotUrl.substring(startIndex).split('?')[0];
          
          console.log("Strategy 2 - Using bucket:", bucketName);
          console.log("Strategy 2 - Extracted path:", filePath);
        }
        // Strategy 3: Fallback - try to get filename from URL
        else {
          console.log("Strategy 3 - Fallback extraction");
          bucketName = 'channel-screenshots'; // Assume default bucket
          
          // Try to get the last segment of the URL as filename
          const urlSegments = screenshotUrl.split('/');
          filePath = urlSegments[urlSegments.length - 1].split('?')[0];
          
          console.log("Strategy 3 - Using default bucket:", bucketName);
          console.log("Strategy 3 - Using filename:", filePath);
        }
        
        // Only attempt storage deletion if we extracted something
        if (bucketName && filePath) {
          console.log("🗑️ Attempting to delete file from storage");
          console.log(`📂 Bucket: ${bucketName}`);
          console.log(`📄 File path: ${filePath}`);
          
          // Try both known bucket naming conventions
          const buckets = [bucketName];
          if (bucketName === 'channel-screenshots') {
            buckets.push('channel_screenshots');
          } else if (bucketName === 'channel_screenshots') {
            buckets.push('channel-screenshots');
          }
          
          // Try deletion from all possible buckets
          for (const bucket of buckets) {
            try {
              console.log(`Attempting deletion from bucket: ${bucket}`);
              const { error: storageError } = await supabase.storage
                .from(bucket)
                .remove([filePath]);
              
              if (storageError) {
                console.warn(`⚠️ Storage deletion warning for bucket ${bucket}:`, storageError);
              } else {
                console.log(`✅ File successfully removed from bucket ${bucket}`);
                break; // Stop trying other buckets if successful
              }
            } catch (bucketError) {
              console.warn(`⚠️ Error with bucket ${bucket}:`, bucketError);
              // Continue to next bucket
            }
          }
        } else {
          console.warn("⚠️ Could not parse storage path from URL:", screenshotUrl);
        }
      } catch (storageErr) {
        // Non-blocking - won't affect UI update
        console.warn("⚠️ Storage deletion error:", storageErr);
      }
      
    } catch (err) {
      console.error("❌ Unexpected error in screenshot deletion:", err);
      toast.error("An error occurred while deleting the screenshot");
    }
  };
  
  return {
    handleDeleteScreenshot
  };
};
