
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelMetadata } from "@/types/youtube";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Play, Eye, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getChannelSize, calculateUploadFrequency, getUploadFrequencyCategory } from "@/utils/channelUtils";
import ChannelStats from "@/components/youtube/ChannelStats";
import VideoPerformance from "@/components/youtube/VideoPerformance";
import MainNavbar from "@/components/MainNavbar";
import { getChannelTypeById } from "@/services/channelTypeService";
import { useEffect, useState } from "react";

const ChannelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channelTypeInfo, setChannelTypeInfo] = useState<any>(null);

  const { data: channel, isLoading: isLoadingChannel } = useQuery({
    queryKey: ["channel", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        
        // Process the channel to get UI channel type from metadata
        if (data && data.metadata && typeof data.metadata === 'object') {
          const typedMetadata = data.metadata as ChannelMetadata;
          if ('ui_channel_type' in typedMetadata) {
            console.log(`Using channel type from metadata: ${typedMetadata.ui_channel_type}`);
            return {
              ...data,
              metadata: typedMetadata,
              channel_type: typedMetadata.ui_channel_type
            } as Channel;
          }
        }
        
        return data as Channel;
      } catch (error) {
        console.error("Error fetching channel data:", error);
        return null;
      }
    },
  });

  useEffect(() => {
    if (channel?.metadata?.ui_channel_type) {
      const fetchChannelTypeInfo = async () => {
        try {
          const typeInfo = await getChannelTypeById(channel.metadata.ui_channel_type);
          if (typeInfo) {
            setChannelTypeInfo(typeInfo);
          }
        } catch (error) {
          console.error("Error fetching channel type info:", error);
        }
      };
      
      fetchChannelTypeInfo();
    }
  }, [channel]);

  const { data: videoStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["video-stats", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("youtube_video_stats")
          .select("*")
          .eq("channel_id", id);
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching video stats:", error);
        return [];
      }
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
              
              {/* Visit Channel Button */}
              <a 
                href={channel.channel_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full sm:w-auto mt-4"
              >
                <Button variant="default" size="lg" className="w-full bg-red-600 hover:bg-red-700 font-medium">
                  <ExternalLink className="mr-2 h-5 w-5" /> Visit this Channel
                </Button>
              </a>
            </CardHeader>
            <CardContent>
              <div className="text-lg text-gray-600 leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: channel.description || "No description available." }}
              />
              
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

          {videoStats && videoStats.length > 0 && <VideoPerformance videoStats={videoStats} />}
        </div>
        
        {channelTypeInfo && (
          <Card className="mt-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Channel Type: {channelTypeInfo.label}</h2>
            
            {channelTypeInfo.description && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Description</h3>
                <div dangerouslySetInnerHTML={{ __html: channelTypeInfo.description }} />
              </div>
            )}
            
            {channelTypeInfo.production && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Production Details</h3>
                <div dangerouslySetInnerHTML={{ __html: channelTypeInfo.production }} />
              </div>
            )}
            
            {channelTypeInfo.example && (
              <div>
                <h3 className="font-medium mb-2">Examples</h3>
                <div dangerouslySetInnerHTML={{ __html: channelTypeInfo.example }} />
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChannelDetails;
