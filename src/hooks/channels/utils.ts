
/**
 * Safely converts database video stats to VideoStats array
 */
export const processVideoStats = (rawVideoStats: any[] | null): any[] => {
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
 */
export const processRawChannelData = (raw: any): any => {
  if (!raw) return null;
  
  // Extract videoStats separately
  const videoStats = processVideoStats(raw.videoStats);
  
  // Return a plain object without explicit type references
  return {
    id: raw.id,
    channel_title: raw.channel_title,
    channel_url: raw.channel_url,
    video_id: raw.video_id,
    description: raw.description || null,
    screenshot_url: raw.screenshot_url || null,
    total_subscribers: raw.total_subscribers || null,
    total_views: raw.total_views || null,
    channel_category: raw.channel_category || null,
    channel_type: raw.channel_type || null,
    keywords: raw.keywords || null,
    niche: raw.niche || null,
    country: raw.country || null,
    is_featured: !!raw.is_featured,
    cpm: raw.cpm || null,
    videoStats
  };
};

/**
 * Maps an array of raw database data to Channel[] type
 */
export const processRawChannelsData = (rawData: any[]): any[] => {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }
  
  return rawData
    .filter(Boolean)
    .map(processRawChannelData);
};
