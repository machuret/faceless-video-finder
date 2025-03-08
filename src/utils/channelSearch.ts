
import { supabase } from "@/integrations/supabase/client";

export const searchChannel = async (channelInput: string) => {
  // If the input looks like a URL, extract channel name or ID
  let searchTerm = channelInput;
  let isChannelId = false;
  
  if (channelInput.includes("youtube.com") || channelInput.includes("youtu.be")) {
    // Extract channel name or ID from URL
    if (channelInput.includes("youtube.com/channel/")) {
      // Handle channel ID format - retain original casing
      const channelIdMatch = channelInput.match(/youtube\.com\/channel\/([^\/\s?&]+)/i);
      if (channelIdMatch && channelIdMatch[1]) {
        searchTerm = channelIdMatch[1];
        isChannelId = true;
      }
    } else if (channelInput.includes("/@")) {
      // Handle @username format
      const handleMatch = channelInput.match(/\/@([^\/\s?&]+)/);
      if (handleMatch && handleMatch[1]) {
        searchTerm = handleMatch[1];
      }
    } else {
      // Try to extract video ID for other formats
      const urlPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = channelInput.match(urlPattern);
      if (match && match[1]) {
        searchTerm = match[1];
      }
    }
  }

  // Build the query based on what we extracted
  let query = supabase.from("youtube_channels").select("*");
  
  if (isChannelId) {
    // For channel IDs, we need to match exactly including case
    // This uses case-sensitive match via ilike for channel_url containing the ID
    query = query.ilike("channel_url", `%${searchTerm}%`);
  } else {
    // For other searches, use OR and case-insensitive search
    query = query.or(`channel_title.ilike.%${searchTerm}%,channel_url.ilike.%${searchTerm}%,video_id.eq.${searchTerm}`);
  }
  
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
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
