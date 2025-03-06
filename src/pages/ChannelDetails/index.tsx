
import { useParams, useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Loader2 } from "lucide-react";
import { useChannelDetails } from "./hooks/useChannelDetails";
import ChannelHeader from "./components/ChannelHeader";
import ChannelStats from "./components/ChannelStats";
import ChannelTypeInfo from "./components/ChannelTypeInfo";
import ChannelVideos from "./components/ChannelVideos";
import TopPerformingVideos from "./components/TopPerformingVideos";
import ChannelUploadStats from "./components/ChannelUploadStats";
import { useEffect } from "react";

const ChannelDetails = () => {
  const { channelId, slug } = useParams();
  const navigate = useNavigate();
  const { 
    channel, 
    videoStats, 
    loading, 
    error, 
    topVideosLoading, 
    mostViewedVideo, 
    mostEngagingVideo 
  } = useChannelDetails(channelId, slug);

  useEffect(() => {
    if (!loading && channel && channelId && !slug) {
      const channelSlug = generateChannelSlug(channel.channel_title);
      navigate(`/channel/${channelSlug}-${channel.id}`, { replace: true });
    }
  }, [loading, channel, channelId, slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold">Loading channel details...</h2>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Channel not found</h2>
            <p className="text-gray-600">The channel you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />

      <main className="container mx-auto px-4 py-8">
        <ChannelHeader channel={channel} />
        
        {/* Revenue Statistics */}
        <div className="mt-8">
          <ChannelStats showOnlyRevenue={true} channel={channel} />
        </div>
        
        {/* Top Performing Videos Section */}
        {(mostViewedVideo || mostEngagingVideo || topVideosLoading) && (
          <TopPerformingVideos 
            mostViewed={mostViewedVideo} 
            mostEngaging={mostEngagingVideo} 
            loading={topVideosLoading}
          />
        )}
        
        <div className="mt-8">
          {/* Only show the channel type info and videos, not the full stats again */}
          <ChannelTypeInfo channelType={channel.metadata?.ui_channel_type || channel.channel_type?.toString()} />
          <ChannelVideos videos={videoStats} />
        </div>
        
        {/* Upload Statistics */}
        <ChannelUploadStats channel={channel} />
      </main>

      <PageFooter />
    </div>
  );
};

export const generateChannelSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Remove consecutive hyphens
    .trim();                  // Trim leading/trailing spaces
};

export default ChannelDetails;
