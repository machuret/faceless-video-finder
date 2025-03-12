
import { Card, CardContent } from "@/components/ui/card";
import OptimizedImage from "@/components/ui/optimized-image";
import { useState, useMemo } from "react";
import { generateLowQualityPlaceholder } from "@/utils/imageUtils";

interface ChannelScreenshotProps {
  screenshotUrl: string;
  channelTitle: string;
}

const ChannelScreenshot = ({ screenshotUrl, channelTitle }: ChannelScreenshotProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate low quality placeholder URL
  const blurDataURL = useMemo(() => {
    if (!screenshotUrl) return '';
    return generateLowQualityPlaceholder(screenshotUrl, 30);
  }, [screenshotUrl]);
  
  if (!screenshotUrl || imageError) return null;
  
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="max-w-[60%] mx-auto">
            <OptimizedImage 
              src={screenshotUrl} 
              alt={`${channelTitle} screenshot`}
              className="w-full h-auto rounded-md"
              onError={() => setImageError(true)}
              placeholder="blur"
              blurDataURL={blurDataURL}
              width={1280}
              height={720}
              priority={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelScreenshot;
