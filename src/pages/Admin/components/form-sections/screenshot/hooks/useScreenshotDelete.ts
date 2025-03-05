
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
    
    try {
      // STEP 1: Update the database first to ensure UI feedback
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
      
      // STEP 2: Try to extract file path using different pattern matching approaches
      console.log("🔍 Attempting to extract storage path information");
      
      // We'll try multiple approaches to handle different URL formats
      let bucketName = '';
      let filePath = '';
      let extractionSuccessful = false;
      
      // Approach 1: Using regex for standard Supabase storage URLs
      const standardPattern = /\/storage\/v1\/object\/(public\/)?([^\/]+)\/(.+)$/;
      let match = screenshotUrl.match(standardPattern);
      
      if (match) {
        bucketName = match[2];
        filePath = match[3];
        extractionSuccessful = true;
        console.log("✅ URL parsed using standard pattern");
      } 
      
      // Approach 2: For bucket-only format URLs
      if (!extractionSuccessful) {
        const bucketPattern = /\/([^\/]+)\/([^?]+)/;
        match = screenshotUrl.match(bucketPattern);
        
        if (match) {
          bucketName = 'channel-screenshots'; // Assume default bucket
          filePath = match[2];
          extractionSuccessful = true;
          console.log("✅ URL parsed using bucket pattern");
        }
      }
      
      // Approach 3: Fallback for direct URLs
      if (!extractionSuccessful && screenshotUrl.includes('/')) {
        bucketName = 'channel-screenshots'; // Assume default bucket
        filePath = screenshotUrl.split('/').pop() || '';
        
        if (filePath) {
          extractionSuccessful = true;
          console.log("✅ URL parsed using basic splitting");
        }
      }
      
      // Clean up any query parameters in the file path
      if (filePath.includes('?')) {
        filePath = filePath.split('?')[0];
        console.log("🧹 Removed query parameters from path");
      }
      
      // STEP 3: Only attempt storage deletion if we successfully extracted path info
      if (extractionSuccessful && bucketName && filePath) {
        console.log("🗑️ Attempting to delete from storage");
        console.log(`📂 Bucket: ${bucketName}`);
        console.log(`📄 File path: ${filePath}`);
        
        try {
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);
          
          if (storageError) {
            console.warn("⚠️ Storage deletion warning:", storageError);
            // Non-blocking - we'll continue with UI updates
          } else {
            console.log("✅ File successfully removed from storage");
          }
        } catch (storageErr) {
          console.warn("⚠️ Storage deletion exception:", storageErr);
          // Non-blocking - we'll continue with UI updates
        }
      } else {
        console.warn("⚠️ Could not parse storage URL format:", screenshotUrl);
        // Continue with UI update even if we couldn't parse the URL
      }
      
      // STEP 4: Update the UI and show success message
      // This happens regardless of storage deletion success
      console.log("🎉 Screenshot removal process completed");
      toast.success("Screenshot removed successfully");
      onScreenshotChange("");
      
    } catch (err) {
      console.error("❌ Unexpected error in screenshot deletion:", err);
      toast.error("An error occurred while deleting the screenshot");
    }
  };
  
  return {
    handleDeleteScreenshot
  };
};
