
import React, { useRef } from "react";
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="screenshot_url">Screenshot</Label>
        <div className="flex space-x-2">
          <UploadButton 
            uploading={uploading}
            onChange={onUpload}
          />
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
