
import { Channel, VideoStats } from "@/types/youtube";
import { DbChannel, DbVideoStats } from "./types";

/**
 * Maps database channel data to the Channel type
 */
export const processChannelData = (item: DbChannel): Channel => {
  // Process video stats safely
  const videoStats: VideoStats[] = [];
  if (Array.isArray(item.videoStats)) {
    for (let j = 0; j < item.videoStats.length; j++) {
      const vs = item.videoStats[j];
      if (vs) {
        videoStats.push({
          title: vs.title,
          video_id: vs.video_id,
          thumbnail_url: vs.thumbnail_url,
          views: vs.views,
          likes: vs.likes
        });
      }
    }
  }
  
  // Create channel object
  return {
    id: item.id,
    channel_title: item.channel_title,
    channel_url: item.channel_url,
    video_id: item.video_id,
    description: item.description,
    screenshot_url: item.screenshot_url,
    total_subscribers: item.total_subscribers,
    total_views: item.total_views,
    channel_category: item.channel_category,
    channel_type: item.channel_type,
    keywords: item.keywords,
    niche: item.niche,
    country: item.country,
    is_featured: item.is_featured,
    cpm: item.cpm,
    videoStats: videoStats
  };
};

/**
 * Maps an array of database channel data to Channel type
 */
export const processChannelsData = (data: any[]): Channel[] => {
  if (!data || !Array.isArray(data)) return [];
  
  const processedData: Channel[] = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i]) {
      processedData.push(processChannelData(data[i]));
    }
  }
  
  return processedData;
};
