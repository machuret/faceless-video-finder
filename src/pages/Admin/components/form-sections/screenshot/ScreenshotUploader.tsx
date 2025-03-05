
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScreenshotUploaderProps {
  channelId: string | undefined;
  screenshotUrl: string;
  onScreenshotChange: (url: string) => void;
}

const ScreenshotUploader = ({ 
  channelId, 
  screenshotUrl, 
  onScreenshotChange 
}: ScreenshotUploaderProps) => {
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
  
  const handleDeleteScreenshot = async () => {
    if (!channelId || !screenshotUrl) {
      toast.error("No screenshot to delete");
      return;
    }
    
    try {
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
      
      // Only update the form state instead of redirecting
      onScreenshotChange("");
    } catch (err) {
      console.error("Error deleting screenshot:", err);
      toast.error("An error occurred while deleting the screenshot");
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="screenshot_url">Screenshot</Label>
        {channelId && (
          <div className="flex space-x-2">
            <div className="relative">
              <Input
                type="file"
                id="screenshot_file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => document.getElementById('screenshot_file')?.click()}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Screenshot"}
              </Button>
            </div>
            {screenshotUrl && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteScreenshot}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Screenshot
              </Button>
            )}
          </div>
        )}
      </div>
      <Input
        type="url"
        id="screenshot_url"
        name="screenshot_url"
        value={screenshotUrl || ""}
        placeholder="Screenshot URL (auto-filled when uploaded)"
        readOnly
        className="bg-gray-50"
      />
      {screenshotUrl && (
        <div className="mt-2">
          <img 
            src={screenshotUrl} 
            alt="Channel Screenshot" 
            className="max-h-40 border rounded-md" 
          />
        </div>
      )}
    </div>
  );
};

export default ScreenshotUploader;
