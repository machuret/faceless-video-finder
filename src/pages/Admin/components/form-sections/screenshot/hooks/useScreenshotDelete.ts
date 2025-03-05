
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
      // First extract the file path from the screenshot URL
      const bucketName = 'channel-screenshots';
      
      // Log the full URL to help with debugging
      console.log("Deleting screenshot with URL:", screenshotUrl);
      
      // Parse the URL to get just the path part after the bucket name
      let filePath = "";
      
      // Handle both URL formats (with or without public/)
      if (screenshotUrl.includes(`/${bucketName}/`)) {
        filePath = screenshotUrl.split(`/${bucketName}/`)[1];
      } else if (screenshotUrl.includes(`/${bucketName}/public/`)) {
        filePath = screenshotUrl.split(`/${bucketName}/public/`)[1];
      } else {
        console.error("Could not parse URL format:", screenshotUrl);
        toast.error("Invalid screenshot URL format");
        return;
      }
      
      // Remove any query parameters if present
      if (filePath.includes('?')) {
        filePath = filePath.split('?')[0];
      }
      
      console.log("Attempting to delete file path:", filePath);
      
      // Remove the file from storage
      const { error: storageError, data } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
        
      console.log("Delete response:", data);
      
      if (storageError) {
        console.error("Error removing file from storage:", storageError);
        toast.error(`Error removing file: ${storageError.message}`);
        // Continue anyway to update the database
        console.warn("Continuing to update database despite storage error");
      } else {
        console.log("File successfully removed from storage");
      }
      
      // Update channel record to remove screenshot URL
      const { error } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: null })
        .eq("id", channelId);
      
      if (error) {
        console.error("Error removing screenshot URL:", error);
        toast.error(`Failed to remove screenshot: ${error.message}`);
        return;
      }
      
      toast.success("Screenshot removed successfully");
      
      // Update the form state
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
