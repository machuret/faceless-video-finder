import { supabase } from "@/integrations/supabase/client";

export const searchChannel = async (channelInput: string) => {
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
      // For other URL searches, use OR and case-insensitive search
      query = query.or(`channel_title.ilike.%${searchTerm}%,channel_url.ilike.%${searchTerm}%,video_id.eq.${searchTerm}`);
    } else {
      // For regular keyword searches (not URLs), do a more comprehensive search
      query = query.or(
        `channel_title.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `channel_category.ilike.%${searchTerm}%,` +
        `niche.ilike.%${searchTerm}%,` +
        `channel_type.ilike.%${searchTerm}%,` +
        `keywords.ilike.%${searchTerm}%`
      );
    }
    
    const { data, error } = await query;

    if (error) {
      console.error("Search error:", error);
      throw error;
    }

    console.log(`Search for "${searchTerm}" returned ${data?.length || 0} results`);
    return data || [];
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
