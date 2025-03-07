
import React, { useRef, useState } from "react";
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
  const [capturingScreenshot, setCapturingScreenshot] = useState(false);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [localScreenshotUrl, setLocalScreenshotUrl] = useState(screenshotUrl);
  
  React.useEffect(() => {
    // Update local state when prop changes
    setLocalScreenshotUrl(screenshotUrl);
  }, [screenshotUrl]);
  
  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (localScreenshotUrl) {
      handleDeleteScreenshot(localScreenshotUrl);
      setLocalScreenshotUrl("");
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
      setCaptureAttempts(prev => prev + 1);
      toast.info("Capturing screenshot... (this may take up to 90 seconds)");

      // Start a timeout to show a progress message after 30 seconds
      const timeoutId = setTimeout(() => {
        toast.info("Still working on your screenshot... this can take a bit longer for some channels");
      }, 30000);

      // Start a second timeout for very long waits
      const longTimeoutId = setTimeout(() => {
        toast.info("This is taking longer than expected. The screenshot may still succeed, please be patient.");
      }, 60000);

      console.log("Invoking take-channel-screenshot function with:", {
        channelUrl: channelUrl.value,
        channelId: channelId
      });

      const { data, error } = await supabase.functions.invoke('take-channel-screenshot', {
        body: {
          channelUrl: channelUrl.value,
          channelId: channelId
        }
      });

      // Clear the timeouts when we get a response
      clearTimeout(timeoutId);
      clearTimeout(longTimeoutId);

      console.log("Screenshot response:", data);

      if (error) {
        console.error("Error capturing screenshot:", error);
        toast.error(`Failed to capture screenshot: ${error.message}`);
        return;
      }

      if (data?.success) {
        // Check for the different possible URLs
        const newScreenshotUrl = data.screenshotUrl || data.apifyUrl || "";
        if (newScreenshotUrl) {
          console.log("Setting new screenshot URL:", newScreenshotUrl);
          onScreenshotChange(newScreenshotUrl);
          setLocalScreenshotUrl(newScreenshotUrl);
          toast.success(data.message || "Screenshot captured successfully");
        } else {
          console.error("No screenshot URL found in response:", data);
          toast.error("Screenshot captured but no URL was returned");
        }
      } else if (data?.warning) {
        // Handle partial success with warning
        const newScreenshotUrl = data.screenshotUrl || data.apifyUrl || "";
        if (newScreenshotUrl) {
          onScreenshotChange(newScreenshotUrl);
          setLocalScreenshotUrl(newScreenshotUrl);
          toast.warning(`Screenshot captured but: ${data.warning}`);
        } else {
          toast.warning(data.warning || "Screenshot process completed with warnings");
        }
      } else {
        console.error("Screenshot capture error response:", data);
        toast.error(data?.error || "Failed to capture screenshot");
        
        // If we've tried less than 2 times and got a specific error, suggest retry
        if (captureAttempts < 2 && data?.error?.includes("empty or invalid")) {
          toast.info("This can happen occasionally. Please try capturing the screenshot again.");
        }
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
          {localScreenshotUrl && (
            <DeleteButton onClick={onDelete} />
          )}
        </div>
      </div>
      <Input
        type="url"
        id="screenshot_url"
        name="screenshot_url"
        value={localScreenshotUrl || ""}
        onChange={(e) => {
          setLocalScreenshotUrl(e.target.value);
          onScreenshotChange(e.target.value);
        }}
        placeholder="Screenshot URL (auto-filled when uploaded)"
        className="bg-gray-50"
      />
      {localScreenshotUrl && (
        <ScreenshotPreview screenshotUrl={localScreenshotUrl} />
      )}
    </div>
  );
};

export default ScreenshotUploader;
