
import React from "react";
import { Video } from "../hooks/useTopVideos";

interface VideoCardProps {
  video: Video;
  title: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, title }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="flex gap-4">
        <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden">
          {video.thumbnailUrl && (
            <img 
              src={video.thumbnailUrl} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
            <div>Views: {formatNumber(video.viewCount)}</div>
            <div>Likes: {formatNumber(video.likeCount)}</div>
            <div>Comments: {formatNumber(video.commentCount)}</div>
            <div>Published: {formatDate(video.publishedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
