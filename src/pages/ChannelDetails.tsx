
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
        <div className="text-base">Loading channel details...</div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-base">Channel not found</div>
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
          className="mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
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

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Channel Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Channel Size</h3>
                <p className="text-xl font-semibold text-blue-600">
                  {channelSize.charAt(0).toUpperCase() + channelSize.slice(1)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Expected Monthly Growth: {getGrowthRange(channelSize)} subscribers
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Upload Frequency</h3>
                <p className="text-xl font-semibold text-green-600">
                  {uploadFrequencyCategory.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {getUploadFrequencyLabel(uploadFrequency)}
                </p>
              </div>

              {channel.cpm && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <p className="text-base">CPM: ${channel.cpm}</p>
                    </div>
                    {channel.revenue_per_video && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <p className="text-base">Revenue per Video: ${channel.revenue_per_video}</p>
                      </div>
                    )}
                    {channel.revenue_per_month && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <p className="text-base">Monthly Revenue: ${channel.revenue_per_month}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {channel.channel_category && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
                  <p className="text-base capitalize">{channel.channel_category}</p>
                </div>
              )}

              {channel.channel_type && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Type</h3>
                  <p className="text-base capitalize">{channel.channel_type}</p>
                </div>
              )}

              {channel.niche && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Niche</h3>
                  <p className="text-base">{channel.niche}</p>
                </div>
              )}

              {channel.country && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Country</h3>
                    <p className="text-base">{channel.country}</p>
                  </div>
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
