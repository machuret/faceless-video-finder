
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Play, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getChannelSize, calculateUploadFrequency, getUploadFrequencyCategory } from "@/utils/channelUtils";
import ChannelStats from "@/components/youtube/ChannelStats";
import VideoPerformance from "@/components/youtube/VideoPerformance";
import MainNavbar from "@/components/MainNavbar";

const ChannelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: channel, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["channel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Channel;
    },
  });

  const { data: videoStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["video-stats", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_video_stats")
        .select("*")
        .eq("channel_id", id);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoadingChannel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-base">Loading channel details...</div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-red-500 text-base">Channel not found</div>
        </div>
      </div>
    );
  }

  const uploadFrequency = calculateUploadFrequency(channel.start_date, channel.video_count);
  const uploadFrequencyCategory = getUploadFrequencyCategory(uploadFrequency);
  const channelSize = getChannelSize(channel.total_subscribers);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="space-y-4">
              {channel.screenshot_url && (
                <img
                  src={channel.screenshot_url}
                  alt={channel.channel_title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              <CardTitle className="text-3xl font-bold tracking-tight">{channel.channel_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">{channel.description || "No description available."}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Subscribers</p>
                    <p className="text-lg font-medium">{channel.total_subscribers?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="text-lg font-medium">{channel.total_views?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Videos</p>
                    <p className="text-lg font-medium">{channel.video_count}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ChannelStats 
            channel={channel}
            channelSize={channelSize}
            uploadFrequency={uploadFrequency}
            uploadFrequencyCategory={uploadFrequencyCategory}
          />

          {videoStats && <VideoPerformance videoStats={videoStats} />}
        </div>
      </div>
    </div>
  );
};

export default ChannelDetails;
