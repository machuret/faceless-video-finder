
import { Card, CardContent } from "@/components/ui/card";
import OptimizedImage from "@/components/ui/optimized-image";
import { useState, useMemo } from "react";

interface ChannelScreenshotProps {
  screenshotUrl: string;
  channelTitle: string;
}

const ChannelScreenshot = ({ screenshotUrl, channelTitle }: ChannelScreenshotProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate low quality placeholder URL
  const blurDataURL = useMemo(() => {
    if (!screenshotUrl) return '';
    
    // For URLs that support quality parameters
    if (!screenshotUrl.includes('supabase')) {
      const separator = screenshotUrl.includes('?') ? '&' : '?';
      return `${screenshotUrl}${separator}quality=10&width=50`;
    }
    
    return '';
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
