
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/ui/lazy-image";
import { useState, useMemo } from "react";

interface ChannelScreenshotProps {
  screenshotUrl: string;
  channelTitle: string;
}

const ChannelScreenshot = ({ screenshotUrl, channelTitle }: ChannelScreenshotProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Clean up URL once and convert to WebP if possible
  const optimizedUrl = useMemo(() => {
    if (!screenshotUrl) return '';
    
    let cleanedUrl = screenshotUrl
      .replace(/\?disableRedirect=true/i, '')
      .replace(/\?token=[^&]+/i, '')
      .replace(/(\?|&)_=\d+/g, ''); // Remove cache busting parameters
    
    // Try to get WebP version if available
    if (!cleanedUrl.includes('format=webp') && 
        !cleanedUrl.endsWith('.webp') && 
        !cleanedUrl.includes('supabase')) {
      
      // Add WebP format parameter for URLs that support it
      const separator = cleanedUrl.includes('?') ? '&' : '?';
      cleanedUrl += `${separator}format=webp`;
    }
    
    return cleanedUrl;
  }, [screenshotUrl]);
  
  // Generate a low quality placeholder URL by adding compression if possible
  const lowQualityUrl = useMemo(() => {
    if (!optimizedUrl) return '';
    
    // For URLs that support quality parameters
    if (!optimizedUrl.includes('supabase')) {
      const separator = optimizedUrl.includes('?') ? '&' : '?';
      return `${optimizedUrl}${separator}quality=10&width=100`;
    }
    
    return '';
  }, [optimizedUrl]);
  
  if (!screenshotUrl || imageError) return null;
  
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="max-w-[60%] mx-auto">
            <LazyImage 
              src={optimizedUrl} 
              alt={`${channelTitle} screenshot`}
              className="w-full h-auto rounded-md"
              onError={() => setImageError(true)}
              fallback="/placeholder.svg"
              lowQualityUrl={lowQualityUrl}
              priority={false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelScreenshot;
