
import React from "react";
import { TopVideosData } from "../hooks/useTopVideos";
import VideoCard from "./VideoCard";

interface VideosListProps {
  topVideos: TopVideosData;
}

const VideosList: React.FC<VideosListProps> = ({ topVideos }) => {
  return (
    <div className="space-y-6">
      {topVideos.mostViewed && (
        <VideoCard video={topVideos.mostViewed} title="Most Viewed Video" />
      )}
      
      {topVideos.mostEngaging && topVideos.mostEngaging.id !== topVideos.mostViewed?.id && (
        <VideoCard video={topVideos.mostEngaging} title="Most Engaging Video" />
      )}
    </div>
  );
};

export default VideosList;
