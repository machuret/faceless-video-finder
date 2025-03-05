
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
    
    console.log("🗑️ Starting screenshot deletion process");
    console.log("🔗 Screenshot URL to delete:", screenshotUrl);
    console.log("📌 Channel ID:", channelId);
    
    try {
      // First clear the form data state to update UI immediately
      onScreenshotChange("");
      
      // Then update database to remove the screenshot reference
      console.log("📝 Updating database to remove screenshot URL");
      const { error: dbError } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: null })
        .eq("id", channelId);
      
      if (dbError) {
        console.error("❌ Database update failed:", dbError);
        toast.error(`Failed to update database: ${dbError.message}`);
        return;
      }
      
      console.log("✅ Database updated and UI refreshed");
      toast.success("Screenshot removed");
      
      // Try to clean up storage in background
      setTimeout(async () => {
        try {
          // Extract filename from URL
          const urlParts = screenshotUrl.split('/');
          const filename = urlParts[urlParts.length - 1].split('?')[0];
          console.log("🔍 Extracted filename:", filename);
          
          // Try to delete from both possible buckets
          const buckets = ['channel-screenshots', 'channel_screenshots'];
          
          for (const bucket of buckets) {
            try {
              console.log(`Attempting to delete from ${bucket}`);
              await supabase.storage
                .from(bucket)
                .remove([filename]);
              
              console.log(`Attempted storage cleanup from ${bucket}`);
            } catch (storageErr) {
              console.log(`Storage cleanup attempt failed for ${bucket}:`, storageErr);
            }
          }
        } catch (err) {
          console.log("Storage cleanup error (non-blocking):", err);
          // Non-blocking - UI is already updated
        }
      }, 0);
      
    } catch (err) {
      console.error("Error in handleDeleteScreenshot:", err);
      toast.error("An error occurred while processing the screenshot deletion");
    }
  };
  
  return {
    handleDeleteScreenshot
  };
};
