
import { Channel } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import VideoPerformance from "@/components/youtube/VideoPerformance";
import { VideoStats } from "@/types/youtube";

interface ChannelVideoStatsProps {
  videoStats: VideoStats[] | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ChannelVideoStats = ({ 
  videoStats, 
  isLoading, 
  onRefresh 
}: ChannelVideoStatsProps) => {
  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Video Statistics</h3>
        <Button 
          onClick={onRefresh}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh Stats
        </Button>
      </div>
      {videoStats && videoStats.length > 0 && (
        <VideoPerformance videoStats={videoStats} />
      )}
    </div>
  );
};
