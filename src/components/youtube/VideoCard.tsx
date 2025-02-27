
import React from 'react';

interface VideoCardProps {
  title: string;
  video_id: string;
  thumbnail_url: string;
  stats: string;
}

const VideoCard = ({ title, video_id, thumbnail_url, stats }: VideoCardProps) => (
  <div className="flex flex-col overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="aspect-video bg-gray-200 relative">
      {thumbnail_url ? (
        <img 
          src={thumbnail_url} 
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${video_id}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
    <div className="p-4">
      <h4 className="text-base font-medium line-clamp-2 mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{stats}</p>
    </div>
  </div>
);

export default VideoCard;
