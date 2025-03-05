
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/ui/lazy-image";

interface ChannelScreenshotProps {
  screenshotUrl: string;
  channelTitle: string;
}

const ChannelScreenshot = ({ screenshotUrl, channelTitle }: ChannelScreenshotProps) => {
  if (!screenshotUrl) return null;
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Channel Screenshot</h3>
      <Card>
        <CardContent className="p-4">
          <LazyImage 
            src={screenshotUrl} 
            alt={`${channelTitle} screenshot`}
            className="w-full h-auto rounded-md"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChannelScreenshot;
