
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseScreenshotUploadProps {
  channelId: string | undefined;
  onScreenshotChange: (url: string) => void;
}

export const useScreenshotUpload = ({ 
  channelId, 
  onScreenshotChange
}: UseScreenshotUploadProps) => {
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
  
  return {
    uploading,
    handleFileUpload
  };
};
