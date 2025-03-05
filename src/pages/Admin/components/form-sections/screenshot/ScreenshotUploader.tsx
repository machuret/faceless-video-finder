
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScreenshotHandler } from "./hooks/useScreenshotHandler";
import UploadButton from "./components/UploadButton";
import DeleteButton from "./components/DeleteButton";
import ScreenshotPreview from "./components/ScreenshotPreview";

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
  
  const onDelete = () => {
    if (screenshotUrl) {
      handleDeleteScreenshot(screenshotUrl);
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="screenshot_url">Screenshot</Label>
        {channelId && (
          <div className="flex space-x-2">
            <UploadButton 
              uploading={uploading}
              onChange={handleFileUpload}
            />
            {screenshotUrl && (
              <DeleteButton onClick={onDelete} />
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
      <ScreenshotPreview screenshotUrl={screenshotUrl} />
    </div>
  );
};

export default ScreenshotUploader;
