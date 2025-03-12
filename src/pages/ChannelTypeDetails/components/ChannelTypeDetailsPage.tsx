
import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
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

const ChannelTypeDetailsPage = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [typeInfo, setTypeInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize other channel types to prevent unnecessary recalculation
  const otherChannelTypes = useMemo(() => {
    return channelTypes
      .filter(type => type.id !== typeId && type.id !== 'other')
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [typeId]);

  // Extract fetch functions to prevent recreating them on every render
  const fetchTypeInfo = useCallback(async () => {
    try {
      console.log("Fetching type info for:", typeId);
      const dbTypeInfo = await fetchChannelTypeById(typeId!);
      
      if (dbTypeInfo) {
        console.log("Found type info in database:", dbTypeInfo);
        setTypeInfo(dbTypeInfo);
      } else {
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
      const localTypeInfo = channelTypes.find(type => type.id === typeId);
      if (localTypeInfo) {
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
  }, [typeId]);

  const fetchChannelsByType = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching channels of type:", typeId);
      
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*");
        
      if (error) {
        console.error("Database error fetching channels:", error);
        throw error;
      }
      
      if (data) {
        const filteredData = data.filter(channel => {
          const directMatch = channel.channel_type === typeId;
          const metadataMatch = channel.channel_type === "other" && 
                channel.metadata && 
                channel.metadata.ui_channel_type === typeId;
          
          return directMatch || metadataMatch;
        });
        
        console.log(`Found ${filteredData.length} channels for type: ${typeId}`);
        setChannels(filteredData as Channel[]);
      }
    } catch (error: any) {
      console.error("Error fetching channels by type:", error);
      setError(error.message || "Error fetching channels");
    } finally {
      setLoading(false);
    }
  }, [typeId]);

  useEffect(() => {
    if (!typeId) return;
    
    fetchTypeInfo();
    fetchChannelsByType();
  }, [typeId, fetchTypeInfo, fetchChannelsByType]);
  
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

export default React.memo(ChannelTypeDetailsPage);
