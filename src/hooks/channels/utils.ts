
import { Channel, VideoStats } from "@/types/youtube";
import { DbChannel } from "./types";

/**
 * Safely converts database video stats to VideoStats array
 */
export const processVideoStats = (rawVideoStats: any[] | null): VideoStats[] => {
  if (!rawVideoStats || !Array.isArray(rawVideoStats)) {
    return [];
  }
  
  return rawVideoStats
    .filter(Boolean)
    .map(vs => ({
      title: vs.title || '',
      video_id: vs.video_id || '',
      thumbnail_url: vs.thumbnail_url || null,
      views: typeof vs.views === 'number' ? vs.views : null,
      likes: typeof vs.likes === 'number' ? vs.likes : null
    }));
};

/**
 * Maps raw database channel data to the Channel type
 * Accepts any because we're breaking the circular reference
 */
export const processRawChannelData = (raw: any): Channel => {
  // Extract videoStats separately to avoid circular references
  const videoStats = processVideoStats(raw.videoStats);
  
  // Extract channel data fields excluding videoStats
  const {
    id,
    channel_title,
    channel_url,
    video_id,
    description,
    screenshot_url,
    total_subscribers,
    total_views,
    channel_category,
    channel_type,
    keywords,
    niche,
    country,
    is_featured,
    cpm
  } = raw;
  
  // Create and return the properly typed channel object
  return {
    id,
    channel_title,
    channel_url,
    video_id,
    description: description || null,
    screenshot_url: screenshot_url || null,
    total_subscribers: total_subscribers || null,
    total_views: total_views || null,
    channel_category: channel_category || null,
    channel_type: channel_type || null,
    keywords: keywords || null,
    niche: niche || null,
    country: country || null,
    is_featured: !!is_featured,
    cpm: cpm || null,
    videoStats
  };
};

/**
 * Maps an array of raw database data to Channel[] type
 */
export const processRawChannelsData = (rawData: any[]): Channel[] => {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }
  
  return rawData
    .filter(Boolean)
    .map(processRawChannelData);
};
