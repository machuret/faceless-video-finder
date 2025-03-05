
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
      onScreenshotChange("");
      toast.success("Screenshot removed successfully");
      
      // STEP 2: Extract storage path from URL (non-blocking)
      console.log("🔍 Attempting to extract storage path from URL:", screenshotUrl);
      
      // Don't block the UI - run storage deletion in background
      setTimeout(async () => {
        try {
          // Try to extract bucket name and path from the URL
          const urlRegex = /\/storage\/v1\/object\/public\/([^\/]+)\/(.+?)(?:\?.*)?$/;
          const match = screenshotUrl.match(urlRegex);
          
          if (match) {
            const [, bucketName, filePath] = match;
            console.log(`📂 Extracted bucket: ${bucketName}`);
            console.log(`📄 Extracted path: ${filePath}`);
            
            // Try to delete from storage
            const { error: storageError } = await supabase.storage
              .from(bucketName)
              .remove([filePath]);
            
            if (storageError) {
              console.warn("⚠️ Storage deletion warning:", storageError);
            } else {
              console.log("✅ File successfully removed from storage");
            }
          } else {
            // Alternative bucket names to try
            const possibleBuckets = ['channel-screenshots', 'channel_screenshots'];
            const filenameMatch = screenshotUrl.split('/').pop()?.split('?')[0];
            
            if (filenameMatch) {
              for (const bucket of possibleBuckets) {
                try {
                  console.log(`Attempting to delete from bucket ${bucket} with filename ${filenameMatch}`);
                  const { error } = await supabase.storage
                    .from(bucket)
                    .remove([filenameMatch]);
                  
                  if (!error) {
                    console.log(`✅ Successfully deleted from ${bucket}`);
                    break;
                  }
                } catch (e) {
                  console.warn(`Failed to delete from ${bucket}:`, e);
                }
              }
            }
          }
        } catch (storageErr) {
          console.warn("⚠️ Storage cleanup error:", storageErr);
          // Non-blocking - won't affect UI update
        }
      }, 0);
      
    } catch (err) {
      console.error("❌ Unexpected error in screenshot deletion:", err);
      toast.error("An error occurred while deleting the screenshot");
    }
  };
  
  return {
    handleDeleteScreenshot
  };
};
