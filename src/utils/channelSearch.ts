
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelMetadata } from "@/types/youtube";
import { transformChannelData } from "@/pages/Admin/components/dashboard/utils/channelMetadataUtils";

export const searchChannel = async (channelInput: string): Promise<Channel[]> => {
  if (!channelInput || !channelInput.trim()) {
    return [];
  }
  
  // If the input looks like a URL, extract channel name or ID
  let searchTerm = channelInput.trim();
  let isChannelId = false;
  let isUrlSearch = false;
  
  if (searchTerm.includes("youtube.com") || searchTerm.includes("youtu.be")) {
    isUrlSearch = true;
    // Extract channel name or ID from URL
    if (searchTerm.includes("youtube.com/channel/")) {
      // Handle channel ID format
      const channelIdMatch = searchTerm.match(/youtube\.com\/channel\/([^\/\s?&]+)/i);
      if (channelIdMatch && channelIdMatch[1]) {
        searchTerm = channelIdMatch[1];
        isChannelId = true;
      }
    } else if (searchTerm.includes("/@")) {
      // Handle @username format
      const handleMatch = searchTerm.match(/\/@([^\/\s?&]+)/);
      if (handleMatch && handleMatch[1]) {
        searchTerm = handleMatch[1];
      }
    } else {
      // Try to extract video ID for other formats
      const urlPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = searchTerm.match(urlPattern);
      if (match && match[1]) {
        searchTerm = match[1];
      }
    }
  }

  console.log("Search term after processing:", searchTerm);

  try {
    // Build the query based on what we extracted
    let query = supabase.from("youtube_channels").select("*, videoStats:youtube_video_stats(*)");
    
    if (isChannelId) {
      // For channel IDs, search in channel_url
      query = query.ilike("channel_url", `%${searchTerm}%`);
    } else if (isUrlSearch) {
      // For other URL searches, use OR with only text fields
      query = query.or(`channel_title.ilike.%${searchTerm}%,channel_url.ilike.%${searchTerm}%,video_id.eq.${searchTerm}`);
    } else {
      // For regular keyword searches (not URLs), focus on text fields only
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 1);
      
      if (searchWords.length > 1) {
        // For multi-word searches, build a simpler query with text fields only
        const searchConditions = searchWords.map(word => 
          `channel_title.ilike.%${word}%,` +
          `description.ilike.%${word}%,` +
          `niche.ilike.%${word}%`
        ).join(',');
        
        query = query.or(searchConditions);
      } else {
        // For single word searches, focus on the most important text fields
        query = query.or(
          `channel_title.ilike.%${searchTerm}%,` +
          `description.ilike.%${searchTerm}%,` +
          `niche.ilike.%${searchTerm}%`
        );
      }
    }
    
    // Add additional debug logging
    console.log("Executing search query for term:", searchTerm);
    
    // Limit the number of results to avoid performance issues
    const { data, error } = await query.limit(100);

    if (error) {
      console.error("Search error details:", error);
      throw new Error(`Database search error: ${error.message}`);
    }

    console.log(`Search for "${searchTerm}" returned ${data?.length || 0} results`);
    
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data format returned from query:", data);
      return [];
    }
    
    // Use the utility function to transform the data to the correct Channel type
    return transformChannelData(data);
    
  } catch (err) {
    console.error("Search execution error:", err);
    throw err;
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  } else {
    return num.toString();
  }
};

export const calculateEarnings = (totalViews: number) => {
  // Using $1.00 per 1000 views as a conservative estimate
  return totalViews / 1000 * 1.00;
};
