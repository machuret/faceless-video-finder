
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelMetadata } from "@/types/youtube";

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
    
    // Convert the data to the correct Channel type
    const channels: Channel[] = data?.map(item => {
      // Ensure metadata is properly typed
      let typedMetadata: ChannelMetadata | undefined;
      if (item.metadata) {
        try {
          // If metadata is already an object, use it directly
          // If it's a string, parse it
          typedMetadata = typeof item.metadata === 'string' 
            ? JSON.parse(item.metadata) as ChannelMetadata 
            : item.metadata as unknown as ChannelMetadata;
        } catch (e) {
          console.error("Error parsing metadata:", e);
          typedMetadata = { }; // Fallback to empty object
        }
      }
      
      return {
        ...item,
        metadata: typedMetadata,
        // Ensure numeric fields are numbers
        total_subscribers: typeof item.total_subscribers === 'string' 
          ? parseInt(item.total_subscribers) 
          : item.total_subscribers,
        total_views: typeof item.total_views === 'string' 
          ? parseInt(item.total_views) 
          : item.total_views,
        video_count: typeof item.video_count === 'string' 
          ? parseInt(item.video_count) 
          : item.video_count,
      } as Channel;
    }) || [];
    
    return channels;
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
