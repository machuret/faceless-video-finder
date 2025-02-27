
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import VideoPerformance from "@/components/youtube/VideoPerformance";
import { VideoStats } from "@/types/youtube";
import { toast } from "sonner";

interface ChannelVideoStatsProps {
  videoStats: VideoStats[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const ChannelVideoStats = ({ 
  videoStats, 
  isLoading, 
  onRefresh 
}: ChannelVideoStatsProps) => {
  const handleRefresh = async () => {
    try {
      await onRefresh();
      toast.success("Video statistics refreshed successfully");
    } catch (error) {
      console.error("Error refreshing video stats:", error);
      toast.error("Failed to refresh video statistics");
    }
  };

  return (
    <div className="border-t pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Video Statistics</h3>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          disabled={isLoading}
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Stats'}
        </Button>
      </div>
      {videoStats && videoStats.length > 0 ? (
        <VideoPerformance videoStats={videoStats} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          {isLoading ? 'Loading video statistics...' : 'No video statistics available'}
        </div>
      )}
    </div>
  );
};
