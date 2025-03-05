
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
      
      // STEP 2: Handle storage deletion in background (non-blocking)
      console.log("🗑️ Attempting storage cleanup in background");
      
      setTimeout(async () => {
        try {
          // Try to extract storage path from URL
          let storageDeleted = false;
          
          // Method 1: Extract from full URL path
          const urlRegex = /\/storage\/v1\/object\/public\/([^\/]+)\/(.+?)(?:\?.*)?$/;
          const match = screenshotUrl.match(urlRegex);
          
          if (match) {
            const [, bucketName, filePath] = match;
            console.log(`📂 Extracted bucket: ${bucketName}, path: ${filePath}`);
            
            const { error: storageError } = await supabase.storage
              .from(bucketName)
              .remove([filePath]);
            
            if (!storageError) {
              console.log(`✅ File successfully removed from ${bucketName}`);
              storageDeleted = true;
            } else {
              console.warn(`⚠️ Failed to delete from ${bucketName}:`, storageError);
            }
          }
          
          // Method 2: Try predefined buckets with filename
          if (!storageDeleted) {
            const possibleBuckets = ['channel-screenshots', 'channel_screenshots'];
            const filenameMatch = screenshotUrl.split('/').pop()?.split('?')[0];
            
            if (filenameMatch) {
              for (const bucket of possibleBuckets) {
                try {
                  console.log(`Attempting to delete ${filenameMatch} from bucket ${bucket}`);
                  const { error } = await supabase.storage
                    .from(bucket)
                    .remove([filenameMatch]);
                  
                  if (!error) {
                    console.log(`✅ Successfully deleted from ${bucket}`);
                    storageDeleted = true;
                    break;
                  }
                } catch (e) {
                  console.warn(`Failed to delete from ${bucket}:`, e);
                }
              }
            }
          }
          
          // Method 3: Try with channelId in filename pattern
          if (!storageDeleted && channelId) {
            const possibleBuckets = ['channel-screenshots', 'channel_screenshots'];
            
            for (const bucket of possibleBuckets) {
              try {
                console.log(`Listing files in ${bucket} for channel ${channelId}`);
                const { data, error } = await supabase.storage
                  .from(bucket)
                  .list('', {
                    search: `channel_${channelId}`
                  });
                
                if (!error && data && data.length > 0) {
                  const files = data.map(item => item.name);
                  console.log(`Found files for channel: ${files.join(', ')}`);
                  
                  const { error: deleteError } = await supabase.storage
                    .from(bucket)
                    .remove(files);
                  
                  if (!deleteError) {
                    console.log(`✅ Successfully deleted channel files from ${bucket}`);
                    storageDeleted = true;
                    break;
                  }
                }
              } catch (e) {
                console.warn(`Error listing/deleting files for channel in ${bucket}:`, e);
              }
            }
          }
          
          if (!storageDeleted) {
            console.log("⚠️ Could not delete storage item, but UI was updated successfully");
          }
        } catch (storageErr) {
          console.warn("⚠️ Storage cleanup error:", storageErr);
          // Non-blocking - UI is already updated
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
