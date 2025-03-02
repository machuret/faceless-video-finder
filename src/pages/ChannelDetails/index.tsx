
import { useParams } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Loader2 } from "lucide-react";
import { useChannelDetails } from "./hooks/useChannelDetails";
import ChannelHeader from "./components/ChannelHeader";
import ChannelTypeInfo from "./components/ChannelTypeInfo";
import ChannelVideos from "./components/ChannelVideos";

const ChannelDetails = () => {
  const { channelId } = useParams();
  const { channel, videoStats, loading, error } = useChannelDetails(channelId);

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
        <ChannelTypeInfo channelType={channel.metadata?.ui_channel_type || channel.channel_type?.toString()} />
        <ChannelVideos videos={videoStats} />
      </main>

      <PageFooter />
    </div>
  );
};

export default ChannelDetails;
