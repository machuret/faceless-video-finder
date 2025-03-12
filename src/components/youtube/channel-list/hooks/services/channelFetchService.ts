
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import { transformChannelData } from "@/pages/Admin/components/dashboard/utils/channelMetadataUtils";

/**
 * Fetches channels with pagination
 */
export const fetchChannelData = async (offset: number = 0, limit: number = 10): Promise<{
  channels: Channel[];
  totalCount: number;
}> => {
  console.log("fetchChannels called with offset:", offset, "limit:", limit);
  
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
        .select("*", { count: 'exact', head: true });
      
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
  
  // Now try to fetch the actual data
  const finalLimit = limit;
  const finalOffset = offset;
  
  // First try direct query
  let channelData: any[] = [];
  let directQuerySucceeded = false;
  
  try {
    const { data, error } = await supabase
      .from("youtube_channels")
      .select("*")
      .order("created_at", { ascending: false })
      .range(finalOffset, finalOffset + finalLimit - 1);

    if (error) {
      console.error("Supabase direct query error:", error);
    } else if (data && data.length > 0) {
      channelData = data;
      directQuerySucceeded = true;
      console.log(`Fetched ${channelData.length} channels from direct Supabase query`);
    }
  } catch (directErr) {
    console.error("Error in direct query:", directErr);
  }
  
  // If direct query failed, try edge function
  if (!directQuerySucceeded) {
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('get-public-channels', {
        body: { 
          limit: finalLimit,
          offset: finalOffset
        }
      });
      
      if (edgeError) {
        throw new Error(`Edge function error: ${edgeError.message}`);
      }
      
      if (edgeData?.channels && Array.isArray(edgeData.channels)) {
        channelData = edgeData.channels;
        console.log(`Fetched ${channelData.length} channels from edge function`);
        
        // Update count if it seems more accurate
        if (edgeData.totalCount && edgeData.totalCount > count) {
          count = edgeData.totalCount;
        }
      }
    } catch (edgeErr) {
      console.error("Edge function error:", edgeErr);
      throw edgeErr;
    }
  }
  
  if (channelData.length === 0) {
    console.log("No channels found in database");
  }
  
  // Transform the channel data to ensure proper typing of metadata
  const typedChannels: Channel[] = transformChannelData(channelData);
  
  return {
    channels: typedChannels,
    totalCount: count
  };
};
