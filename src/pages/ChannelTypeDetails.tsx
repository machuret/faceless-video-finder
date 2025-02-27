import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelMetadata } from "@/types/youtube";
import { formatDate } from "@/utils/channelUtils";
import MainNavbar from "@/components/MainNavbar";
import { toast } from "sonner";

interface SupabaseChannelData {
  id: string;
  video_id: string;
  channel_title: string;
  channel_url: string;
  screenshot_url: string | null;
  description: string | null;
  total_views: number | null;
  total_subscribers: number | null;
  channel_category: string | null;
  channel_type: string | null;
  metadata: ChannelMetadata | null;
  [key: string]: any;
}

const ChannelTypeDetails = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  
  const typeInfo = channelTypes.find(type => type.id === typeId);
  
  useEffect(() => {
    if (!typeId) return;
    
    const fetchChannelsByType = async () => {
      setLoading(true);
      try {
        console.log("Fetching channels of type:", typeId);
        
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*");
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data)) {
          console.error("Invalid data format received from Supabase", data);
          throw new Error("Invalid data format received");
        }
        
        const typedData = data as SupabaseChannelData[];
        
        const filteredData = typedData.filter(channel => {
          return channel.channel_type === "other" && 
                 channel.metadata && 
                 channel.metadata.ui_channel_type === typeId;
        });
        
        console.log("Fetched channels:", data);
        console.log("Filtered channels for type:", typeId, filteredData);
        
        setChannels(filteredData as unknown as Channel[]);
      } catch (error) {
        console.error("Error fetching channels by type:", error);
        toast.error("Error fetching channels");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannelsByType();
  }, [typeId]);
  
  if (!typeInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6">
            <h1 className="font-crimson text-2xl font-bold mb-4">Channel Type Not Found</h1>
            <p className="font-lato">The requested channel type does not exist.</p>
            <Button 
              variant="outline" 
              className="mt-4 font-montserrat"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-4 font-montserrat"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card className="p-6 mb-6">
          <h1 className="font-crimson text-2xl font-bold mb-2">{typeInfo.label}</h1>
          <p className="font-lato text-gray-600 mb-4">{typeInfo.description}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-montserrat font-medium mb-2">Typical Production</h3>
            <p className="font-lato">{typeInfo.production}</p>
          </div>
          
          <div className="mt-4">
            <h3 className="font-montserrat font-medium mb-2">Examples</h3>
            <p className="font-lato">{typeInfo.example}</p>
          </div>
        </Card>
        
        <h2 className="font-crimson text-xl font-semibold mb-4">Channels of this type</h2>
        
        {loading ? (
          <div className="text-center py-8 font-lato">Loading channels...</div>
        ) : channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map(channel => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <p className="font-lato">No channels found for this type.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

const ChannelCard = ({ channel }: { channel: Channel }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex items-start gap-4 mb-4">
          {channel.screenshot_url && (
            <img
              src={channel.screenshot_url}
              alt={channel.channel_title}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold line-clamp-2">{channel.channel_title}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {channel.channel_category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {channel.channel_category}
                </span>
              )}
              {channel.niche && (
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {channel.niche}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-sm text-gray-500">Subscribers</p>
            <p className="font-medium">{channel.total_subscribers?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Videos</p>
            <p className="font-medium">{channel.video_count?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Views</p>
            <p className="font-medium">{channel.total_views?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Since</p>
            <p className="font-medium">{channel.start_date ? formatDate(channel.start_date) : 'N/A'}</p>
          </div>
        </div>
        
        {channel.description && (
          <div className="mt-2">
            <p className="text-sm text-gray-700 line-clamp-3">{channel.description}</p>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t">
        <a 
          href={channel.channel_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View YouTube Channel
        </a>
      </div>
    </Card>
  );
};

export default ChannelTypeDetails;
