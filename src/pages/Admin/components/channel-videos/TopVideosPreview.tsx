
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useTopVideos } from "./hooks/useTopVideos";
import VideosList from "./components/VideosList";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";

interface TopVideosPreviewProps {
  channelId: string;
  youtubeChannelId?: string;
}

const TopVideosPreview: React.FC<TopVideosPreviewProps> = ({ channelId, youtubeChannelId }) => {
  const { loading, topVideos, handleFetchVideos } = useTopVideos(channelId, youtubeChannelId);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Top Performing Videos</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFetchVideos}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Fetch Videos
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!topVideos && !loading && <EmptyState />}
        {loading && <LoadingState />}
        {topVideos && !loading && <VideosList topVideos={topVideos} />}
      </CardContent>
    </Card>
  );
};

export default TopVideosPreview;
