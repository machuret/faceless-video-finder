
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelSize, UploadFrequency } from "@/types/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Users, Play, Eye, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getChannelSize = (subscribers: number | null): ChannelSize => {
  if (!subscribers) return "small";
  if (subscribers >= 1_000_000) return "big";
  if (subscribers >= 100_000) return "larger";
  if (subscribers >= 10_000) return "established";
  if (subscribers >= 1_000) return "growing";
  return "small";
};

const getGrowthRange = (size: ChannelSize): string => {
  switch (size) {
    case "big": return "10,000 - 50,000";
    case "larger": return "2,000 - 10,000";
    case "established": return "500 - 2,000";
    case "growing": return "100 - 500";
    case "small": return "10 - 100";
  }
};

const calculateUploadFrequency = (startDate: string | null, videoCount: number | null): number | null => {
  if (!startDate || !videoCount) return null;
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return videoCount / diffWeeks;
};

const getUploadFrequencyCategory = (frequency: number | null): UploadFrequency => {
  if (!frequency || frequency <= 0.25) return "very_low";
  if (frequency <= 0.5) return "low";
  if (frequency <= 1) return "medium";
  if (frequency <= 2) return "high";
  if (frequency <= 3) return "very_high";
  return "insane";
};

const getUploadFrequencyLabel = (frequency: number | null): string => {
  if (!frequency) return "N/A";
  const videosPerMonth = frequency * 4;
  return `${frequency.toFixed(1)} videos/week (${Math.round(videosPerMonth)} per month)`;
};

const ChannelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: channel, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading channel details...</div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Channel not found</div>
      </div>
    );
  }

  const uploadFrequency = calculateUploadFrequency(channel.start_date, channel.video_count);
  const uploadFrequencyCategory = getUploadFrequencyCategory(uploadFrequency);
  const channelSize = getChannelSize(channel.total_subscribers);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              {channel.screenshot_url && (
                <img
                  src={channel.screenshot_url}
                  alt={channel.channel_title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <CardTitle className="text-2xl">{channel.channel_title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{channel.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>{channel.total_subscribers?.toLocaleString()} subscribers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  <span>{channel.total_views?.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-500" />
                  <span>{channel.video_count} videos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Channel Size</h3>
                <p className="text-lg font-semibold text-blue-600">
                  {channelSize.charAt(0).toUpperCase() + channelSize.slice(1)}
                </p>
                <p className="text-sm text-gray-500">
                  Expected Monthly Growth: {getGrowthRange(channelSize)} subscribers
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Upload Frequency</h3>
                <p className="text-lg font-semibold text-green-600">
                  {uploadFrequencyCategory.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </p>
                <p className="text-sm text-gray-500">
                  {getUploadFrequencyLabel(uploadFrequency)}
                </p>
              </div>

              {channel.cpm && (
                <div>
                  <h3 className="font-medium mb-1">Revenue Metrics</h3>
                  <div className="space-y-2">
                    <p className="text-sm">CPM: ${channel.cpm}</p>
                    {channel.revenue_per_video && (
                      <p className="text-sm">Revenue per Video: ${channel.revenue_per_video}</p>
                    )}
                    {channel.revenue_per_month && (
                      <p className="text-sm">Monthly Revenue: ${channel.revenue_per_month}</p>
                    )}
                  </div>
                </div>
              )}

              {channel.channel_category && (
                <div>
                  <h3 className="font-medium mb-1">Category</h3>
                  <p className="text-sm capitalize">{channel.channel_category}</p>
                </div>
              )}

              {channel.channel_type && (
                <div>
                  <h3 className="font-medium mb-1">Type</h3>
                  <p className="text-sm capitalize">{channel.channel_type}</p>
                </div>
              )}

              {channel.niche && (
                <div>
                  <h3 className="font-medium mb-1">Niche</h3>
                  <p className="text-sm">{channel.niche}</p>
                </div>
              )}

              {channel.country && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{channel.country}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetails;
