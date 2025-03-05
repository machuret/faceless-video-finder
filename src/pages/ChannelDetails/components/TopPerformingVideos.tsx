
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ThumbsUp, MessageSquare, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import LazyImage from "@/components/ui/lazy-image";

interface TopVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

interface TopPerformingVideosProps {
  mostViewed: TopVideo | null;
  mostEngaging: TopVideo | null;
  loading: boolean;
}

const TopPerformingVideos = ({ mostViewed, mostEngaging, loading }: TopPerformingVideosProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Performing Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <div className="aspect-video bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <div className="aspect-video bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!mostViewed && !mostEngaging) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Top Performing Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mostViewed && (
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <a 
              href={`https://youtube.com/watch?v=${mostViewed.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative">
                <LazyImage 
                  src={mostViewed.thumbnailUrl} 
                  alt={mostViewed.title} 
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute top-0 left-0 bg-blue-600 text-white py-1 px-3 flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Most Viewed</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{mostViewed.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{mostViewed.viewCount.toLocaleString()} views</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{mostViewed.likeCount.toLocaleString()} likes</span>
                  </div>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(mostViewed.publishedAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </a>
          </Card>
        )}
        
        {mostEngaging && (
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <a 
              href={`https://youtube.com/watch?v=${mostEngaging.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative">
                <LazyImage 
                  src={mostEngaging.thumbnailUrl} 
                  alt={mostEngaging.title} 
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute top-0 left-0 bg-green-600 text-white py-1 px-3 flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Most Engaging</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{mostEngaging.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{mostEngaging.likeCount.toLocaleString()} likes</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{mostEngaging.commentCount.toLocaleString()} comments</span>
                  </div>
                  <span className="text-xs">
                    {formatDistanceToNow(new Date(mostEngaging.publishedAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </a>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TopPerformingVideos;
