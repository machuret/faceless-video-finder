
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoCard from './VideoCard';
import { VideoStats } from '@/types/youtube';

interface VideoPerformanceProps {
  videoStats: VideoStats[];
}

const VideoPerformance = ({ videoStats }: VideoPerformanceProps) => {
  // Log the incoming video stats to help debugging
  console.log("VideoPerformance received stats:", videoStats);
  
  const getBestPerforming = () => {
    if (!videoStats?.length) return null;
    return videoStats.reduce((prev, current) => 
      (current.views > prev.views) ? current : prev
    );
  };

  const getWorstPerforming = () => {
    if (!videoStats?.length) return null;
    return videoStats.reduce((prev, current) => 
      (current.views < prev.views) ? current : prev
    );
  };

  const getMostLiked = () => {
    if (!videoStats?.length) return null;
    return videoStats.reduce((prev, current) => 
      (current.likes > prev.likes) ? current : prev
    );
  };

  const getLeastEngaged = () => {
    if (!videoStats?.length) return null;
    return videoStats.reduce((prev, current) => {
      const prevRatio = prev.likes / (prev.views || 1);
      const currentRatio = current.likes / (current.views || 1);
      return (currentRatio < prevRatio) ? current : prev;
    });
  };

  const bestVideo = getBestPerforming();
  const worstVideo = getWorstPerforming();
  const mostLikedVideo = getMostLiked();
  const leastEngagedVideo = getLeastEngaged();

  // Log the calculated stats
  console.log("Calculated video stats:", { 
    bestVideo, worstVideo, mostLikedVideo, leastEngagedVideo 
  });

  if (!videoStats || videoStats.length === 0) {
    return (
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Video Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            No video statistics available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Video Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestVideo && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Best Performing</h3>
              <VideoCard
                title={bestVideo.title}
                video_id={bestVideo.video_id}
                thumbnail_url={bestVideo.thumbnail_url || `https://i.ytimg.com/vi/${bestVideo.video_id}/hqdefault.jpg`}
                stats={`${bestVideo.views.toLocaleString()} views`}
              />
            </div>
          )}

          {worstVideo && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Worst Performing</h3>
              <VideoCard
                title={worstVideo.title}
                video_id={worstVideo.video_id}
                thumbnail_url={worstVideo.thumbnail_url || `https://i.ytimg.com/vi/${worstVideo.video_id}/hqdefault.jpg`}
                stats={`${worstVideo.views.toLocaleString()} views`}
              />
            </div>
          )}

          {mostLikedVideo && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Most Liked</h3>
              <VideoCard
                title={mostLikedVideo.title}
                video_id={mostLikedVideo.video_id}
                thumbnail_url={mostLikedVideo.thumbnail_url || `https://i.ytimg.com/vi/${mostLikedVideo.video_id}/hqdefault.jpg`}
                stats={`${mostLikedVideo.likes.toLocaleString()} likes`}
              />
            </div>
          )}

          {leastEngagedVideo && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Least Engaged</h3>
              <VideoCard
                title={leastEngagedVideo.title}
                video_id={leastEngagedVideo.video_id}
                thumbnail_url={leastEngagedVideo.thumbnail_url || `https://i.ytimg.com/vi/${leastEngagedVideo.video_id}/hqdefault.jpg`}
                stats={`${(leastEngagedVideo.likes / (leastEngagedVideo.views || 1) * 100).toFixed(2)}% engagement`}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default VideoPerformance;
