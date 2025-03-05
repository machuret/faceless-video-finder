
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
    const fileName = `channel_${channelId}_${new Date().toISOString().replace(/[:.]/g, "-")}.${fileExt}`;
    
    setUploading(true);
    toast.info("Uploading screenshot...");
    
    try {
      console.log("📤 Starting screenshot upload process");
      console.log("📌 Channel ID:", channelId);
      console.log("📂 File name:", fileName);
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('channel-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("❌ Error uploading screenshot:", uploadError);
        toast.error(`Failed to upload screenshot: ${uploadError.message}`);
        setUploading(false);
        return;
      }
      
      console.log("✅ File uploaded successfully:", uploadData);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('channel-screenshots')
        .getPublicUrl(fileName);
      
      if (!publicUrlData?.publicUrl) {
        console.error("❌ Failed to get public URL");
        toast.error("Failed to get public URL for screenshot");
        setUploading(false);
        return;
      }
      
      console.log("🔗 Public URL generated:", publicUrlData.publicUrl);
      
      // Update channel record with screenshot URL
      const { error: updateError } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: publicUrlData.publicUrl })
        .eq("id", channelId);
      
      if (updateError) {
        console.error("❌ Error updating screenshot URL:", updateError);
        toast.error(`Failed to update screenshot URL: ${updateError.message}`);
        setUploading(false);
        return;
      }
      
      console.log("✅ Database updated with screenshot URL");
      toast.success("Screenshot uploaded successfully!");
      
      // Update the form state
      onScreenshotChange(publicUrlData.publicUrl);
    } catch (err) {
      console.error("❌ Unexpected error in upload process:", err);
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
