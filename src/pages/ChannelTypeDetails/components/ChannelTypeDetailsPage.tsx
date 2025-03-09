
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelMetadata } from "@/types/youtube";
import MainNavbar from "@/components/MainNavbar";
import { toast } from "sonner";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { fetchChannelTypeById } from "@/services/channelTypeService";
import ChannelTypeNotFound from "./ChannelTypeNotFound";
import ChannelTypeHeader from "./ChannelTypeHeader";
import ChannelsOfType from "./ChannelsOfType";
import OtherChannelTypes from "./OtherChannelTypes";
import PageFooter from "@/components/home/PageFooter";

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
  metadata?: ChannelMetadata | null;
  [key: string]: any;
}

const ChannelTypeDetailsPage = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [typeInfo, setTypeInfo] = useState<any>(null);
  const [otherChannelTypes, setOtherChannelTypes] = useState<any[]>([]);
  
  useEffect(() => {
    if (!typeId) return;
    
    const fetchTypeInfo = async () => {
      try {
        const dbTypeInfo = await fetchChannelTypeById(typeId);
        if (dbTypeInfo) {
          setTypeInfo(dbTypeInfo);
        } else {
          const localTypeInfo = channelTypes.find(type => type.id === typeId);
          setTypeInfo(localTypeInfo);
        }
      } catch (error) {
        console.error("Error fetching type info:", error);
        const localTypeInfo = channelTypes.find(type => type.id === typeId);
        setTypeInfo(localTypeInfo);
      }
    };
    
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
        
        const typedData = data as unknown as SupabaseChannelData[];
        
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

    const fetchOtherChannelTypes = () => {
      // Filter out the current channel type and get 4 random other types
      const others = channelTypes
        .filter(type => type.id !== typeId && type.id !== 'other')
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      
      setOtherChannelTypes(others);
    };
    
    fetchTypeInfo();
    fetchChannelsByType();
    fetchOtherChannelTypes();
  }, [typeId]);
  
  if (!typeInfo) {
    return <ChannelTypeNotFound />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <ChannelTypeHeader typeInfo={typeInfo} />
        <ChannelsOfType loading={loading} channels={channels} />
        <OtherChannelTypes otherChannelTypes={otherChannelTypes} />
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelTypeDetailsPage;
