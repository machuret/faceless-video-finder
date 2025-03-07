
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Youtube } from "lucide-react";
import { TopVideo } from "../hooks/types";
import { format } from "date-fns";

interface LatestVideosProps {
  videos: TopVideo[];
  loading: boolean;
}

const LatestVideos = ({ videos, loading }: LatestVideosProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-5 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Videos</h2>
        <p className="text-gray-500">No recent videos found for this channel.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <a 
                href={`https://youtube.com/watch?v=${video.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {video.thumbnailUrl ? (
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <Youtube className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{video.viewCount?.toLocaleString() || 0} views</span>
                    <span>{format(new Date(video.publishedAt), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestVideos;
