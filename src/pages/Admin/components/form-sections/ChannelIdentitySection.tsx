
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
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
    
    try {
      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: {
          channelUrl: formData.channel_url,
          channelId: formData.id
        }
      });
      
      if (error) {
        console.error("Error taking screenshot:", error);
        toast.error("Failed to take channel screenshot");
        return;
      }
      
      if (data.success) {
        toast.success("Channel screenshot taken successfully!");
        handleScreenshotChange(data.screenshotUrl);
      } else {
        toast.error(data.message || "Failed to take channel screenshot");
      }
    } catch (err) {
      console.error("Error invoking screenshot function:", err);
      toast.error("An error occurred while taking the screenshot");
    } finally {
      setTakingScreenshot(false);
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
        <div className="flex items-center justify-between">
          <Label htmlFor="screenshot_url">Screenshot URL</Label>
          {isEditMode && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleTakeScreenshot}
              disabled={takingScreenshot}
              className="flex items-center gap-2 mb-2"
            >
              <Camera className="h-4 w-4" />
              {takingScreenshot ? "Taking Screenshot..." : "Take Screenshot"}
            </Button>
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
