
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Channel, VideoStats } from "@/types/youtube";
import VideoCard from "@/components/youtube/VideoCard";

interface ChannelGridProps {
  channels: Channel[];
  loading: boolean;
  resetFilters: () => void;
}

const ChannelGrid = ({ channels, loading, resetFilters }: ChannelGridProps) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium font-montserrat">Loading channels...</p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 text-lg font-lato">No channels found matching your criteria.</p>
        <Button 
          variant="outline" 
          className="mt-4 font-montserrat"
          onClick={resetFilters}
        >
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <Card key={channel.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <Link to={`/channel/${channel.id}`}>
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {channel.screenshot_url ? (
                  <img 
                    src={channel.screenshot_url} 
                    alt={channel.channel_title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-400 font-lato">No screenshot</p>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-crimson text-lg font-semibold mb-2 line-clamp-1">{channel.channel_title}</h3>
                <div className="flex items-center gap-x-4 text-sm text-gray-500 mb-3 font-montserrat">
                  <div className="flex items-center">
                    <span className="font-medium">{channel.total_subscribers ? parseInt(channel.total_subscribers.toString()).toLocaleString() : '0'}</span>
                    <span className="ml-1">subscribers</span>
                  </div>
                  <div>
                    <span className="font-medium">{channel.total_views ? parseInt(channel.total_views.toString()).toLocaleString() : '0'}</span>
                    <span className="ml-1">views</span>
                  </div>
                </div>
                <p className="font-lato text-gray-600 line-clamp-2 text-sm mb-2">
                  {channel.description || "No description available"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {channel.niche && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-montserrat">
                      {channel.niche}
                    </span>
                  )}
                  {channel.channel_category && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-montserrat">
                      {channel.channel_category}
                    </span>
                  )}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Featured Videos Section */}
      {channels.some(channel => channel.videoStats && channel.videoStats.length > 0) && (
        <div className="mt-12">
          <h2 className="font-crimson text-2xl font-bold mb-6 text-gray-800">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels
              .filter(channel => channel.videoStats && channel.videoStats.length > 0)
              .flatMap(channel => channel.videoStats || [])
              .slice(0, 6)
              .map((video: VideoStats) => (
                <VideoCard
                  key={video.video_id}
                  title={video.title || "Untitled Video"}
                  video_id={video.video_id}
                  thumbnail_url={video.thumbnail_url || ""}
                  stats={`${video.views?.toLocaleString() || 0} views`}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelGrid;
