
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FormSectionWrapper from "./FormSectionWrapper";
import { ChannelFormData } from "@/types/forms";

interface ChannelIdentitySectionProps {
  formData: ChannelFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleScreenshotChange: (url: string) => void;
  isEditMode: boolean;
}

const ChannelIdentitySection = ({ 
  formData, 
  handleChange, 
  handleScreenshotChange, 
  isEditMode 
}: ChannelIdentitySectionProps) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    if (!formData.id) {
      toast.error("Please save the channel first before uploading a screenshot");
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${formData.id}/screenshot.${fileExt}`;
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
        .eq("id", formData.id);
      
      if (updateError) {
        console.error("Error updating screenshot URL:", updateError);
        toast.error(`Failed to update screenshot URL: ${updateError.message}`);
        return;
      }
      
      toast.success("Screenshot uploaded successfully!");
      
      // Update the form state
      handleScreenshotChange(publicUrlData.publicUrl);
    } catch (err) {
      console.error("Error in upload process:", err);
      toast.error("An error occurred while uploading the screenshot");
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeleteScreenshot = async () => {
    if (!formData.id || !formData.screenshot_url) {
      toast.error("No screenshot to delete");
      return;
    }
    
    try {
      // Update channel record to remove screenshot URL
      const { error } = await supabase
        .from("youtube_channels")
        .update({ screenshot_url: null })
        .eq("id", formData.id);
      
      if (error) {
        console.error("Error removing screenshot URL:", error);
        toast.error(`Failed to remove screenshot: ${error.message}`);
        return;
      }
      
      toast.success("Screenshot removed successfully");
      
      // Only update the form state instead of redirecting
      handleScreenshotChange("");
    } catch (err) {
      console.error("Error deleting screenshot:", err);
      toast.error("An error occurred while deleting the screenshot");
    }
  };
  
  return (
    <FormSectionWrapper title="Channel Identity" description="Basic information about the YouTube channel">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="channel_title">Channel Title</Label>
          <Input
            type="text"
            id="channel_title"
            name="channel_title"
            value={formData.channel_title}
            onChange={handleChange}
            placeholder="Enter channel title"
            required
          />
        </div>
        <div>
          <Label htmlFor="channel_url">Channel URL</Label>
          <Input
            type="url"
            id="channel_url"
            name="channel_url"
            value={formData.channel_url}
            onChange={handleChange}
            placeholder="Enter channel URL"
            required
          />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter channel description"
          rows={3}
        />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="screenshot_url">Screenshot</Label>
          {formData.id && (
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
              {formData.screenshot_url && (
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
          value={formData.screenshot_url}
          onChange={handleChange}
          placeholder="Screenshot URL (auto-filled when uploaded)"
          readOnly
          className="bg-gray-50"
        />
        {formData.screenshot_url && (
          <div className="mt-2">
            <img 
              src={formData.screenshot_url} 
              alt="Channel Screenshot" 
              className="max-h-40 border rounded-md" 
            />
          </div>
        )}
      </div>
    </FormSectionWrapper>
  );
};

export default ChannelIdentitySection;
