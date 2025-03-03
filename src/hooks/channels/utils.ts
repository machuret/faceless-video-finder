
import { Channel, VideoStats } from "@/types/youtube";
import { DbChannel } from "./types";

/**
 * Maps database channel data to the Channel type
 */
export const processChannelData = (item: DbChannel): Channel => {
  // Create an empty array for video stats
  const videoStats: VideoStats[] = [];
  
  // Process video stats if they exist, with careful type handling
  if (item.videoStats && Array.isArray(item.videoStats)) {
    item.videoStats.forEach((vs) => {
      if (vs) {
        videoStats.push({
          title: vs.title || '',
          video_id: vs.video_id || '',
          thumbnail_url: vs.thumbnail_url || null,
          views: typeof vs.views === 'number' ? vs.views : null,
          likes: typeof vs.likes === 'number' ? vs.likes : null
        });
      }
    });
  }
  
  // Create and return the channel object
  return {
    id: item.id,
    channel_title: item.channel_title,
    channel_url: item.channel_url,
    video_id: item.video_id,
    description: item.description || null,
    screenshot_url: item.screenshot_url || null,
    total_subscribers: item.total_subscribers || null,
    total_views: item.total_views || null,
    channel_category: item.channel_category || null,
    channel_type: item.channel_type || null,
    keywords: item.keywords || null,
    niche: item.niche || null,
    country: item.country || null,
    is_featured: !!item.is_featured,
    cpm: item.cpm || null,
    videoStats
  };
};

/**
 * Maps an array of database channel data to Channel type
 */
export const processChannelsData = (data: any[]): Channel[] => {
  if (!data || !Array.isArray(data)) return [];
  
  // Use type assertion to any[] to avoid circular references
  return data
    .filter(Boolean)
    .map(item => processChannelData(item as any));
};
