
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import { transformChannelData } from "@/pages/Admin/components/dashboard/utils/channelMetadataUtils";
import { Json } from "@/integrations/supabase/types";

/**
 * Fetches channels with pagination and optimized field selection
 */
export const fetchChannelData = async (offset: number = 0, limit: number = 10): Promise<{
  channels: Channel[];
  totalCount: number;
}> => {
  console.log("fetchChannels called with offset:", offset, "limit:", limit);
  
  // Define fields we need for channel list to optimize query performance
  const requiredFields = [
    'id', 
    'channel_title', 
    'description', 
    'total_subscribers', 
    'total_views', 
    'screenshot_url', 
    'niche',
    'video_count',
    'channel_type',
    'metadata',
    'is_featured',
    'created_at'
  ];
  
  // First try getting the count using the edge function for consistency
  let count = 0;
  try {
    const { data: countData, error: countError } = await supabase.functions.invoke('get-public-channels', {
      body: { 
        limit: 1,
        offset: 0,
        countOnly: true
      }
    });
    
    if (!countError && countData?.totalCount) {
      count = countData.totalCount;
      console.log("Total channel count from edge function:", count);
    }
  } catch (err) {
    console.warn("Error fetching count from edge function, will try direct query");
  }
  
  // If edge function count failed, try direct query
  if (count === 0) {
    try {
      const { count: directCount, error: countError } = await supabase
        .from("youtube_channels")
        .select("id", { count: 'exact', head: true }); // Only select ID for counting
      
      if (countError) {
        console.error("Error fetching channel count:", countError);
      } else {
        count = directCount || 0;
        console.log("Total channel count from direct query:", count);
      }
    } catch (countErr) {
      console.error("Error getting count:", countErr);
    }
  }
  
  // Now try to fetch the actual data with optimized field selection
  const finalLimit = limit;
  const finalOffset = offset;
  
  // Try direct query first for better reliability
  try {
    const { data, error } = await supabase
      .from("youtube_channels")
      .select(requiredFields.join(','))
      .order("created_at", { ascending: false })
      .range(finalOffset, finalOffset + finalLimit - 1);

    if (error) {
      console.error("Supabase direct query error:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No channels found in database");
      return {
        channels: [],
        totalCount: count
      };
    }
    
    // Transform the channel data to ensure proper typing of metadata
    const typedChannels = transformChannelData(data as { metadata?: Json }[]);
    console.log(`Fetched ${typedChannels.length} channels from direct Supabase query`);
    
    return {
      channels: typedChannels,
      totalCount: count
    };
  } catch (directErr) {
    console.error("Error in direct query:", directErr);
    
    // If direct query fails, try the edge function as fallback
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
        body: { 
          limit: finalLimit,
          offset: finalOffset,
          fields: requiredFields
        }
      });
      
      if (edgeError) {
        console.error("Edge function error:", edgeError);
        throw edgeError;
      }
      
      if (edgeData?.channels && Array.isArray(edgeData.channels)) {
        // Validate the data returned to ensure it's not an error array
        const isValidData = edgeData.channels.length === 0 || 
          (edgeData.channels[0] && 'id' in edgeData.channels[0]);
        
        if (isValidData) {
          // Transform the channel data to ensure proper typing of metadata
          const typedChannels = transformChannelData(edgeData.channels as { metadata?: Json }[]);
          console.log(`Fetched ${typedChannels.length} channels from edge function`);
          
          // Update count if it seems more accurate
          if (edgeData.totalCount && edgeData.totalCount > count) {
            count = edgeData.totalCount;
          }
          
          return {
            channels: typedChannels,
            totalCount: count
          };
        }
      }
      
      // If we get here, both methods failed
      throw new Error("Failed to fetch channels data from both direct query and edge function");
    } catch (fallbackErr) {
      console.error("Error in fallback fetch:", fallbackErr);
      throw fallbackErr;
    }
  }
};
