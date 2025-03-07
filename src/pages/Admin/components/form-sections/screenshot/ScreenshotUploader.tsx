
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScreenshotHandler } from "./hooks/useScreenshotHandler";
import UploadButton from "./components/UploadButton";
import DeleteButton from "./components/DeleteButton";
import ScreenshotPreview from "./components/ScreenshotPreview";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
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
  const {
    uploading,
    handleFileUpload,
    handleDeleteScreenshot
  } = useScreenshotHandler({
    channelId,
    onScreenshotChange
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturingScreenshot, setCapturingScreenshot] = React.useState(false);
  
  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (screenshotUrl) {
      handleDeleteScreenshot(screenshotUrl);
      // No navigation occurs as the function updates state directly
    }
  };
  
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e);
    // Clear the file input value after upload attempt
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const captureScreenshot = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!channelId) {
      toast.error("Please save the channel first before capturing a screenshot");
      return;
    }

    const channelUrl = document.getElementById("channel_url") as HTMLInputElement;
    if (!channelUrl || !channelUrl.value) {
      toast.error("Please enter a channel URL first");
      return;
    }

    try {
      setCapturingScreenshot(true);
      toast.info("Capturing screenshot... (this may take up to 60 seconds)");

      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: {
          channelUrl: channelUrl.value,
          channelId: channelId
        }
      });

      if (error) {
        console.error("Error capturing screenshot:", error);
        toast.error(`Failed to capture screenshot: ${error.message}`);
        return;
      }

      if (data?.success && data?.screenshotUrl) {
        onScreenshotChange(data.screenshotUrl);
        toast.success("Screenshot captured successfully");
      } else if (data?.warning) {
        onScreenshotChange(data.screenshotUrl || "");
        toast.warning(`Screenshot captured but: ${data.warning}`);
      } else {
        toast.error(data?.error || "Failed to capture screenshot");
      }
    } catch (err) {
      console.error("Screenshot capture error:", err);
      toast.error("An error occurred while capturing the screenshot");
    } finally {
      setCapturingScreenshot(false);
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="screenshot_url">Screenshot</Label>
        <div className="flex flex-wrap gap-2">
          <UploadButton 
            uploading={uploading}
            onChange={onUpload}
          />
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={captureScreenshot}
            disabled={capturingScreenshot || !channelId}
            className="flex items-center gap-2"
            type="button"
          >
            <Camera className="h-4 w-4" />
            {capturingScreenshot ? "Capturing..." : "Capture Screenshot"}
          </Button>
          {screenshotUrl && (
            <DeleteButton onClick={onDelete} />
          )}
        </div>
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
        <ScreenshotPreview screenshotUrl={screenshotUrl} />
      )}
    </div>
  );
};

export default ScreenshotUploader;
