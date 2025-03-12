
import React from "react";
import OptimizedImage from "@/components/ui/optimized-image";
import { generateLowQualityPlaceholder } from "@/utils/imageUtils";

interface ScreenshotPreviewProps {
  screenshotUrl: string;
}

const ScreenshotPreview = ({ screenshotUrl }: ScreenshotPreviewProps) => {
  if (!screenshotUrl) return null;
  
  const blurDataURL = generateLowQualityPlaceholder(screenshotUrl, 20);
  
  return (
    <div className="mt-2">
      <OptimizedImage 
        src={screenshotUrl} 
        alt="Channel Screenshot" 
        className="max-h-40 border rounded-md" 
        placeholder="blur"
        blurDataURL={blurDataURL}
        width={640}
        height={360}
      />
    </div>
  );
};

export default ScreenshotPreview;
