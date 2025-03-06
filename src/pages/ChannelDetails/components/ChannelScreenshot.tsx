
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/ui/lazy-image";

interface ChannelScreenshotProps {
  screenshotUrl: string;
  channelTitle: string;
}

const ChannelScreenshot = ({ screenshotUrl, channelTitle }: ChannelScreenshotProps) => {
  if (!screenshotUrl) return null;
  
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="max-w-[60%] mx-auto">
            <LazyImage 
              src={screenshotUrl} 
              alt={`${channelTitle} screenshot`}
              className="w-full h-auto rounded-md"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelScreenshot;
