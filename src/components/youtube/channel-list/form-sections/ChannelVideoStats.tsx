
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
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <div className="flex justify-center mb-4">
            <RefreshCcw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
          <p>Loading video statistics...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
        </div>
      ) : videoStats && videoStats.length > 0 ? (
        <VideoPerformance videoStats={videoStats} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No video statistics available</p>
          <p className="text-sm text-gray-400 mt-2">Click "Refresh Stats" to fetch video statistics</p>
        </div>
      )}
    </div>
  );
};
