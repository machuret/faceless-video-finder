
import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { convertToChannelMetadata } from "@/pages/Admin/components/dashboard/utils/channelMetadataUtils";
import { useDebounce } from "@/utils/hooks/useDebounce";

// Number of channels to fetch per page
const CHANNELS_PER_PAGE = 6;

const ChannelTypeDetailsPage = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [typeInfo, setTypeInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalChannels, setTotalChannels] = useState(0);
  const [hasMoreChannels, setHasMoreChannels] = useState(true);

  // Debounce page changes to prevent excessive queries
  const debouncedPage = useDebounce(currentPage, 300);
  
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

  // Get total count of channels for pagination
  const fetchChannelCount = useCallback(async () => {
    try {
      // First query to get count
      const countQuery = supabase
        .from("youtube_channels")
        .select("id", { count: "exact" });
        
      // Add filtering condition for type
      if (typeId) {
        countQuery.or(`channel_type.eq.${typeId},and(channel_type.eq.other,metadata->ui_channel_type.eq.${typeId})`);
      }
      
      const { count, error } = await countQuery;
      
      if (error) {
        console.error("Error fetching channel count:", error);
        throw error;
      }
      
      console.log(`Total channels for type ${typeId}: ${count}`);
      setTotalChannels(count || 0);
      setHasMoreChannels((currentPage * CHANNELS_PER_PAGE) < (count || 0));
      
    } catch (error) {
      console.error("Error in fetchChannelCount:", error);
    }
  }, [typeId, currentPage]);

  // Fetch channels with pagination and optimized database filtering
  const fetchChannelsByType = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching channels of type: ${typeId}, page: ${debouncedPage}`);
      
      // Calculate pagination range
      const from = (debouncedPage - 1) * CHANNELS_PER_PAGE;
      const to = from + CHANNELS_PER_PAGE - 1;
      
      // Build query with range
      const query = supabase
        .from("youtube_channels")
        .select("*")
        .range(from, to);
      
      // Add filtering directly in the query - this moves filtering to DB side
      if (typeId) {
        // Use OR condition to match either direct channel_type or metadata.ui_channel_type
        query.or(`channel_type.eq.${typeId},and(channel_type.eq.other,metadata->ui_channel_type.eq.${typeId})`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Database error fetching channels:", error);
        throw error;
      }
      
      if (data) {
        console.log(`Found ${data.length} channels for type: ${typeId} on page ${debouncedPage}`);
        
        // For first page, replace channels - for subsequent pages, append
        if (debouncedPage === 1) {
          setChannels(data as Channel[]);
        } else {
          setChannels(prev => [...prev, ...(data as Channel[])]);
        }
        
        // Update hasMore flag
        setHasMoreChannels(data.length === CHANNELS_PER_PAGE);
      }
    } catch (error: any) {
      console.error("Error fetching channels by type:", error);
      setError(error.message || "Error fetching channels");
    } finally {
      setLoading(false);
    }
  }, [typeId, debouncedPage]);

  // Load more channels
  const loadMoreChannels = useCallback(() => {
    if (!loading && hasMoreChannels) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, hasMoreChannels]);

  // Fetch type info on initial load
  useEffect(() => {
    if (!typeId) return;
    fetchTypeInfo();
  }, [typeId, fetchTypeInfo]);
  
  // Fetch channel count and reset pagination when type changes
  useEffect(() => {
    if (!typeId) return;
    setCurrentPage(1); // Reset to first page
    fetchChannelCount();
  }, [typeId, fetchChannelCount]);
  
  // Fetch channels when page changes (debounced)
  useEffect(() => {
    if (!typeId) return;
    fetchChannelsByType();
  }, [typeId, debouncedPage, fetchChannelsByType]);
  
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
            onRetry={() => {
              setCurrentPage(1);
              fetchChannelsByType();
            }} 
          />
        ) : (
          <ChannelsOfType 
            loading={loading} 
            channels={channels}
            loadMoreChannels={loadMoreChannels}
            hasMoreChannels={hasMoreChannels}
            totalChannels={totalChannels}
          />
        )}
        
        <OtherChannelTypes otherChannelTypes={otherChannelTypes} />
      </div>
      
      <PageFooter />
    </div>
  );
};

export default React.memo(ChannelTypeDetailsPage);
