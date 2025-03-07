
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/ui/lazy-image";
import { useState } from "react";

interface ChannelScreenshotProps {
  screenshotUrl: string;
  channelTitle: string;
}

const ChannelScreenshot = ({ screenshotUrl, channelTitle }: ChannelScreenshotProps) => {
  const [imageError, setImageError] = useState(false);
  
  if (!screenshotUrl || imageError) return null;
  
  // Clean up URL if it's from Apify - remove the disableRedirect parameter
  const cleanedUrl = screenshotUrl.includes('?disableRedirect=true') 
    ? screenshotUrl.replace('?disableRedirect=true', '') 
    : screenshotUrl;
  
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
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelScreenshot;
