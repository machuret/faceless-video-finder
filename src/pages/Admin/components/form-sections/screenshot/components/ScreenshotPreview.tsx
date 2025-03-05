
import React from "react";

interface ScreenshotPreviewProps {
  screenshotUrl: string;
}

const ScreenshotPreview = ({ screenshotUrl }: ScreenshotPreviewProps) => {
  if (!screenshotUrl) return null;
  
  return (
    <div className="mt-2">
      <img 
        src={screenshotUrl} 
        alt="Channel Screenshot" 
        className="max-h-40 border rounded-md" 
      />
    </div>
  );
};

export default ScreenshotPreview;
