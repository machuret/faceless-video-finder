
import { useMemo } from 'react';
import { Channel, VideoStats } from '@/types/youtube';

/**
 * Extract top videos from channels using memoization
 */
export function useVideosFromChannels(channels: Channel[] = []) {
  return useMemo(() => {
    // Get videos from channels that have videoStats
    return channels
      .flatMap(channel => channel.videoStats || [])
      .filter((video): video is VideoStats => !!video)
      .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
      .slice(0, 10);
  }, [channels]);
}
