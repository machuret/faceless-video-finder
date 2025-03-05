
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseScreenshotDeleteProps {
  channelId: string | undefined;
  onScreenshotChange: (url: string) => void;
}

export const useScreenshotDelete = ({ 
  channelId, 
  onScreenshotChange
}: UseScreenshotDeleteProps) => {
  
  const handleDeleteScreenshot = async (screenshotUrl: string) => {
    if (!channelId || !screenshotUrl) {
      toast.error("No screenshot to delete");
      return;
    }
    
    try {
      console.log("Starting screenshot deletion process");
      console.log("Screenshot URL to delete:", screenshotUrl);
      
      // First update the channel record to remove the screenshot URL
      // This ensures the UI updates even if storage deletion fails
      const { error: updateError } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: null })
        .eq("id", channelId);
      
      if (updateError) {
        console.error("Error removing screenshot URL from database:", updateError);
        toast.error(`Failed to update database: ${updateError.message}`);
        return;
      }
      
      // Extract file path from URL for storage deletion
      let bucketName = '';
      let filePath = '';
      
      // Simple regex to extract the bucket name and path
      const storageUrlPattern = /\/storage\/v1\/object\/(public\/)?([^\/]+)\/(.+)$/;
      const match = screenshotUrl.match(storageUrlPattern);
      
      if (match) {
        bucketName = match[2];
        filePath = match[3];
        
        // Remove any query parameters if present
        if (filePath.includes('?')) {
          filePath = filePath.split('?')[0];
        }
        
        console.log("Extracted bucket:", bucketName);
        console.log("Extracted file path:", filePath);
        
        // Try to remove from storage (but don't block UI update if this fails)
        try {
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);
          
          if (storageError) {
            console.warn("Storage deletion error (non-blocking):", storageError);
            // This is a non-blocking error, we continue
          } else {
            console.log("File successfully removed from storage");
          }
        } catch (storageErr) {
          console.warn("Storage deletion exception (non-blocking):", storageErr);
          // Non-blocking error, continue with UI update
        }
      } else {
        console.warn("Could not parse storage URL format:", screenshotUrl);
        // Continue with UI update even if we couldn't parse the URL
      }
      
      // Success message and form update regardless of storage deletion outcome
      toast.success("Screenshot removed successfully");
      onScreenshotChange("");
      
    } catch (err) {
      console.error("Error deleting screenshot:", err);
      toast.error("An error occurred while deleting the screenshot");
    }
  };
  
  return {
    handleDeleteScreenshot
  };
};
