import React from "react";
import { useParams } from "react-router-dom";
import { useChannelDetails } from "./hooks/useChannelDetails";
import ChannelHeader from "./components/ChannelHeader";
import ChannelVideos from "./components/ChannelVideos";
import TopPerformingVideos from "./components/TopPerformingVideos";
import RelatedChannels from "./components/RelatedChannels";
import { generateChannelSlug } from ".";
import LatestVideos from "./components/LatestVideos";

const ChannelDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const {
    channel,
    videoStats,
    loading,
    error,
    topVideosLoading,
    mostViewedVideo,
    mostEngagingVideo,
    latestVideos,
    topVideosError
  } = useChannelDetails(undefined, slug);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {loading && <p>Loading channel details...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {!loading && !error && channel && (
        <div className="space-y-8">
          <ChannelHeader channel={channel} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Channel Description</h2>
              <p>{channel.description}</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Channel Stats</h2>
              <ul>
                <li>Subscribers: {channel.total_subscribers}</li>
                <li>Views: {channel.total_views}</li>
                <li>Videos: {channel.video_count}</li>
              </ul>
            </div>
          </div>
          
          {/* Add Latest Videos section before Top Performing Videos */}
          <LatestVideos videos={latestVideos} loading={topVideosLoading} />
          
          <TopPerformingVideos
            mostViewedVideo={mostViewedVideo}
            mostEngagingVideo={mostEngagingVideo}
            loading={topVideosLoading}
            error={topVideosError}
          />
          
          <ChannelVideos videos={videoStats} />
          
          <RelatedChannels />
        </div>
      )}
    </div>
  );
};

export default ChannelDetailsPage;
