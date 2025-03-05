
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseScreenshotHandlerProps {
  channelId: string | undefined;
  onScreenshotChange: (url: string) => void;
}

export const useScreenshotHandler = ({ 
  channelId, 
  onScreenshotChange
}: UseScreenshotHandlerProps) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    if (!channelId) {
      toast.error("Please save the channel first before uploading a screenshot");
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${channelId}/screenshot.${fileExt}`;
    const filePath = `${fileName}`;
    
    setUploading(true);
    toast.info("Uploading screenshot...");
    
    try {
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('channel-screenshots')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Error uploading screenshot:", uploadError);
        toast.error(`Failed to upload screenshot: ${uploadError.message}`);
        return;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('channel-screenshots')
        .getPublicUrl(filePath);
      
      if (!publicUrlData.publicUrl) {
        toast.error("Failed to get public URL for screenshot");
        return;
      }
      
      // Update channel record with screenshot URL
      const { error: updateError } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: publicUrlData.publicUrl })
        .eq("id", channelId);
      
      if (updateError) {
        console.error("Error updating screenshot URL:", updateError);
        toast.error(`Failed to update screenshot URL: ${updateError.message}`);
        return;
      }
      
      toast.success("Screenshot uploaded successfully!");
      
      // Update the form state
      onScreenshotChange(publicUrlData.publicUrl);
    } catch (err) {
      console.error("Error in upload process:", err);
      toast.error("An error occurred while uploading the screenshot");
    } finally {
      setUploading(false);
    }
  };
  
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
    uploading,
    handleFileUpload,
    handleDeleteScreenshot
  };
};
