
import { supabase } from "@/integrations/supabase/client";

export const searchChannel = async (channelInput: string) => {
  // If the input looks like a URL, extract channel name or ID
  let searchTerm = channelInput;
  if (channelInput.includes("youtube.com") || channelInput.includes("youtu.be")) {
    // Extract channel name or ID from URL
    const urlPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = channelInput.match(urlPattern);
    if (match && match[1]) {
      searchTerm = match[1];
    } else if (channelInput.includes("/@")) {
      // Handle @username format
      const handleMatch = channelInput.match(/\/@([^\/\s]+)/);
      if (handleMatch && handleMatch[1]) {
        searchTerm = handleMatch[1];
      }
    }
  }

  // Try to match by channel title, URL, or video ID
  let query = supabase
    .from("youtube_channels")
    .select("*")
    .or(`channel_title.ilike.%${searchTerm}%,channel_url.ilike.%${searchTerm}%,video_id.eq.${searchTerm}`);
  
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
