
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Youtube, Users, Play, Calendar, Bookmark, CircleDollarSign, MapPin, BarChart, Globe, Upload } from "lucide-react";
import { channelTypes } from "@/components/youtube/channel-list/constants";

const ChannelDetails = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoStats, setVideoStats] = useState<any[]>([]);
  const [typeInfo, setTypeInfo] = useState<any>(null);

  useEffect(() => {
    if (channelId) {
      fetchChannelDetails(channelId);
    }
  }, [channelId]);

  useEffect(() => {
    if (channel?.metadata?.ui_channel_type) {
      const foundType = channelTypes.find(type => type.id === channel.metadata.ui_channel_type);
      setTypeInfo(foundType);
    } else if (channel?.channel_type) {
      const foundType = channelTypes.find(type => type.id === channel.channel_type.toString());
      setTypeInfo(foundType);
    }
  }, [channel]);

  const fetchChannelDetails = async (id: string) => {
    setLoading(true);
    try {
      // Fetch channel details
      const { data: channelData, error: channelError } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .single();

      if (channelError) throw channelError;
      
      // Fetch video stats for this channel
      const { data: videoData, error: videoError } = await supabase
        .from("youtube_video_stats")
        .select("*")
        .eq("channel_id", id);
        
      if (videoError) throw videoError;

      setChannel(channelData as unknown as Channel);
      setVideoStats(videoData || []);
    } catch (error) {
      console.error("Error fetching channel details:", error);
      toast.error("Failed to load channel details");
    } finally {
      setLoading(false);
    }
  };

  // Find the channel type label based on the channel type ID
  const getChannelTypeLabel = (typeId: string | undefined) => {
    if (!typeId) return 'N/A';
    const foundType = channelTypes.find(type => type.id === typeId);
    return foundType ? foundType.label : typeId;
  };

  // Format upload frequency to be more readable
  const formatUploadFrequency = (frequency: string | undefined) => {
    if (!frequency) return 'N/A';
    return frequency
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">{channel.channel_title}</h1>
            {channel.niche && (
              <div className="inline-block px-3 py-1 bg-blue-500 bg-opacity-30 rounded-full text-sm font-medium">
                {channel.niche}
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Channel Information</h2>
                
                <div className="space-y-4">
                  {channel.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700">{channel.description}</p>
                    </div>
                  )}
                  
                  {channel.channel_url && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Channel URL</h3>
                      <a 
                        href={channel.channel_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Visit YouTube Channel
                      </a>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {channel.channel_type && (
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm text-gray-500 mb-1">Channel Type</h4>
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 text-blue-600 mr-2" />
                          <span>{getChannelTypeLabel(channel.metadata?.ui_channel_type || channel.channel_type.toString())}</span>
                        </div>
                      </div>
                    )}
                    
                    {channel.channel_category && (
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm text-gray-500 mb-1">Category</h4>
                        <div className="flex items-center">
                          <Bookmark className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="capitalize">{channel.channel_category}</span>
                        </div>
                      </div>
                    )}
                    
                    {channel.country && (
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm text-gray-500 mb-1">Country</h4>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-blue-600 mr-2" />
                          <span>{channel.country}</span>
                        </div>
                      </div>
                    )}
                    
                    {channel.upload_frequency && (
                      <div className="border rounded-md p-3">
                        <h4 className="text-sm text-gray-500 mb-1">Upload Frequency</h4>
                        <div className="flex items-center">
                          <Upload className="h-4 w-4 text-blue-600 mr-2" />
                          <span>{formatUploadFrequency(channel.upload_frequency)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {channel.keywords && channel.keywords.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {channel.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Channel Statistics</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <Users className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Subscribers</p>
                        <p className="text-xl font-bold">
                          {channel.total_subscribers ? 
                            parseInt(channel.total_subscribers.toString()).toLocaleString() : 
                            'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <Play className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Views</p>
                        <p className="text-xl font-bold">
                          {channel.total_views ? 
                            parseInt(channel.total_views.toString()).toLocaleString() : 
                            'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Videos</p>
                        <p className="text-xl font-bold">
                          {channel.video_count || 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <CircleDollarSign className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Est. CPM</p>
                        <p className="text-xl font-bold">
                          {channel.cpm ? `$${channel.cpm.toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {channel.revenue_per_month && (
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">Estimated Monthly Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${parseFloat(channel.revenue_per_month.toString()).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Channel Type Information Section */}
        {typeInfo && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Channel Type: {typeInfo.label}</h2>
              
              {typeInfo.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: typeInfo.description }}
                  />
                </div>
              )}
              
              {typeInfo.production && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">How to Create</h3>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: typeInfo.production }}
                  />
                </div>
              )}
              
              {typeInfo.example && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Example Ideas</h3>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: typeInfo.example }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        
        {videoStats.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoStats.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <a 
                      href={`https://youtube.com/watch?v=${video.video_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {video.thumbnail_url ? (
                        <div className="aspect-video bg-gray-200 relative overflow-hidden">
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <Youtube className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{video.views?.toLocaleString() || 0} views</span>
                          <span>{video.likes?.toLocaleString() || 0} likes</span>
                        </div>
                      </CardContent>
                    </a>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <PageFooter />
    </div>
  );
};

export default ChannelDetails;
