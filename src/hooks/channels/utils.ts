
import { Channel, VideoStats } from "@/types/youtube";
import { DbChannel } from "./types";

/**
 * Maps database channel data to the Channel type
 */
export const processChannelData = (item: DbChannel): Channel => {
  // Process video stats, treating them as untyped data
  const videoStats: VideoStats[] = [];
  
  if (item.videoStats && Array.isArray(item.videoStats)) {
    item.videoStats.forEach((vs: any) => {
      if (vs) {
        videoStats.push({
          title: vs.title || '',
          video_id: vs.video_id || '',
          thumbnail_url: vs.thumbnail_url || null,
          views: vs.views || null,
          likes: vs.likes || null
        });
      }
    });
  }
  
  // Create channel object
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
    is_featured: !!item.is_featured, // Convert to boolean
    cpm: item.cpm || null,
    videoStats: videoStats
  };
};

/**
 * Maps an array of database channel data to Channel type
 */
export const processChannelsData = (data: any[]): Channel[] => {
  if (!data || !Array.isArray(data)) return [];
  
  // Use simple map with basic type checking
  return data
    .filter(Boolean)
    .map(item => processChannelData(item as DbChannel));
};
