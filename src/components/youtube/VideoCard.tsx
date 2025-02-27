
import React from 'react';

interface VideoCardProps {
  title: string;
  video_id: string;
  thumbnail_url: string;
  stats: string;
}

const VideoCard = ({ title, video_id, thumbnail_url, stats }: VideoCardProps) => (
  <div className="flex flex-col gap-2">
    <div className="aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${video_id}`}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
    <div>
      <h4 className="text-sm font-medium line-clamp-1">{title}</h4>
      <p className="text-xs text-gray-500">{stats}</p>
    </div>
  </div>
);

export default VideoCard;
