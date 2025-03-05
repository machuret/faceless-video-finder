
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Trash2 } from "lucide-react";
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
  const [takingScreenshot, setTakingScreenshot] = useState(false);
  
  const handleTakeScreenshot = async () => {
    if (!formData.channel_url) {
      toast.error("Channel URL is required to take a screenshot");
      return;
    }
    
    if (!formData.id) {
      toast.error("Please save the channel first before taking a screenshot");
      return;
    }
    
    setTakingScreenshot(true);
    toast.info("Taking screenshot via API... This may take a few moments");
    
    try {
      console.log("Taking screenshot for channel:", formData.id);
      console.log("Channel URL:", formData.channel_url);
      
      const response = await supabase.functions.invoke('take-channel-screenshot', {
        body: {
          channelUrl: formData.channel_url,
          channelId: formData.id
        }
      });
      
      console.log("Screenshot response:", response);
      
      if (response.error) {
        console.error("Error invoking screenshot function:", response.error);
        toast.error(`Failed to take channel screenshot: ${response.error.message}`);
        return;
      }
      
      const { data } = response;
      
      if (data.success) {
        toast.success("Channel screenshot taken successfully!");
        handleScreenshotChange(data.screenshotUrl);
      } else {
        toast.error(data.error || "Failed to take channel screenshot");
        console.error("Screenshot error:", data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Error invoking screenshot function:", err);
      toast.error("An error occurred while taking the screenshot");
    } finally {
      setTakingScreenshot(false);
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
          <Label htmlFor="screenshot_url">Screenshot URL</Label>
          {formData.id && (
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleTakeScreenshot}
                disabled={takingScreenshot}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {takingScreenshot ? "Taking Screenshot..." : "Take Screenshot"}
              </Button>
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
          placeholder="Enter screenshot URL"
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
