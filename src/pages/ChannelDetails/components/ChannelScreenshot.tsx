
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/ui/lazy-image";
import { useState, useMemo } from "react";

interface ChannelScreenshotProps {
  screenshotUrl: string;
  channelTitle: string;
}

const ChannelScreenshot = ({ screenshotUrl, channelTitle }: ChannelScreenshotProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Clean up URL once, not on every render
  const cleanedUrl = useMemo(() => {
    if (!screenshotUrl) return '';
    
    return screenshotUrl
      .replace(/\?disableRedirect=true/i, '')
      .replace(/\?token=[^&]+/i, '')
      .replace(/(\?|&)_=\d+/g, ''); // Remove cache busting parameters
  }, [screenshotUrl]);
  
  if (!screenshotUrl || imageError) return null;
  
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="max-w-[60%] mx-auto">
            <LazyImage 
              src={cleanedUrl} 
              alt={`${channelTitle} screenshot`}
              className="w-full h-auto rounded-md"
              onError={() => setImageError(true)}
              fallback="/placeholder.svg"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelScreenshot;
