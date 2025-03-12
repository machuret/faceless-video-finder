
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
import { ErrorState } from "@/components/youtube/channel-list/components/ErrorState";

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
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!typeId) return;
    
    const fetchTypeInfo = async () => {
      try {
        console.log("Fetching type info for:", typeId);
        const dbTypeInfo = await fetchChannelTypeById(typeId);
        
        if (dbTypeInfo) {
          console.log("Found type info in database or local constants:", dbTypeInfo);
          setTypeInfo(dbTypeInfo);
        } else {
          // If not found in database, try local constants as a fallback
          const localTypeInfo = channelTypes.find(type => type.id === typeId);
          
          if (localTypeInfo) {
            console.log("Found type info in local constants:", localTypeInfo);
            setTypeInfo({
              id: localTypeInfo.id,
              label: localTypeInfo.label,
              description: localTypeInfo.description,
              production: localTypeInfo.production,
              example: localTypeInfo.example,
              image_url: null
            });
          } else {
            console.warn("Channel type not found:", typeId);
            setTypeInfo(null);
          }
        }
      } catch (error) {
        console.error("Error fetching type info:", error);
        
        // Always try fallback to local constants on error
        const localTypeInfo = channelTypes.find(type => type.id === typeId);
        if (localTypeInfo) {
          console.log("Using local fallback for type info:", localTypeInfo);
          setTypeInfo({
            id: localTypeInfo.id,
            label: localTypeInfo.label,
            description: localTypeInfo.description,
            production: localTypeInfo.production,
            example: localTypeInfo.example,
            image_url: null
          });
        } else {
          setTypeInfo(null);
        }
      }
    };
    
    const fetchChannelsByType = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching channels of type:", typeId);
        
        // Use a try-catch to handle database errors
        try {
          const { data, error } = await supabase
            .from("youtube_channels")
            .select("*");
            
          if (error) {
            console.error("Database error fetching channels:", error);
            throw error;
          }
          
          if (data && Array.isArray(data)) {
            const typedData = data as unknown as SupabaseChannelData[];
            
            // Filter channels based on type - check both direct type and metadata
            const filteredData = typedData.filter(channel => {
              const directMatch = channel.channel_type === typeId;
              const metadataMatch = channel.channel_type === "other" && 
                    channel.metadata && 
                    channel.metadata.ui_channel_type === typeId;
              
              return directMatch || metadataMatch;
            });
            
            console.log(`Found ${filteredData.length} channels for type: ${typeId}`);
            setChannels(filteredData as unknown as Channel[]);
          } else {
            console.error("Invalid data format received from Supabase", data);
            setChannels([]);
          }
        } catch (dbError) {
          console.error("Database error fetching channels:", dbError);
          // For database errors, just show empty channels rather than error state
          setChannels([]);
        }
      } catch (error: any) {
        console.error("Error fetching channels by type:", error);
        setError(error.message || "Error fetching channels");
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
        
        {error ? (
          <ErrorState 
            error={error} 
            onRetry={() => window.location.reload()} 
          />
        ) : (
          <ChannelsOfType loading={loading} channels={channels} />
        )}
        
        <OtherChannelTypes otherChannelTypes={otherChannelTypes} />
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelTypeDetailsPage;
