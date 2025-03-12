
import { supabase } from "@/integrations/supabase/client";
import { TopVideo } from "@/pages/ChannelDetails/hooks/types";

/**
 * Fetches top performing videos for a YouTube channel
 * @param youtubeChannelId YouTube channel ID
 * @returns Most viewed and most engaging videos
 */
export const fetchTopPerformingVideos = async (youtubeChannelId: string) => {
  console.log(`Fetching top videos with YouTube channel ID: ${youtubeChannelId}`);
  
  try {
    // Try both direct and edge function approaches
    const [functionsResponse, directResponse] = await Promise.allSettled([
      // Method 1: Edge function
      supabase.functions.invoke('fetch-top-videos', {
        body: { channelId: youtubeChannelId }
      }),
      
      // Method 2: Direct API call to YouTube (if possible via client)
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeChannelId}&order=viewCount&maxResults=10`)
        .then(res => res.json())
        .catch(() => null)
    ]);
    
    // Check edge function result
    if (functionsResponse.status === 'fulfilled' && functionsResponse.value) {
      const { data, error } = functionsResponse.value;
      
      if (!error && data?.mostViewed) {
        return {
          mostViewedVideo: data?.mostViewed as TopVideo || null,
          mostEngagingVideo: data?.mostEngaging as TopVideo || null
        };
      }
    }
    
    // Check direct API result as fallback
    if (directResponse.status === 'fulfilled' && directResponse.value?.items?.length > 0) {
      const items = directResponse.value.items;
      const mostViewed = items[0];
      
      // Fix the TopVideo type issue by ensuring data matches the interface
      return {
        mostViewedVideo: {
          id: mostViewed.id?.videoId || '',
          title: mostViewed.snippet?.title || '',
          thumbnailUrl: mostViewed.snippet?.thumbnails?.high?.url || '',
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          publishedAt: mostViewed.snippet?.publishedAt || new Date().toISOString()
        } as TopVideo,
        mostEngagingVideo: null
      };
    }
    
    // If both failed, return empty result
    console.error("Both methods failed to fetch top videos");
    return { mostViewedVideo: null, mostEngagingVideo: null };
  } catch (error) {
    console.error("Error in fetchTopPerformingVideos:", error);
    return {
      mostViewedVideo: null,
      mostEngagingVideo: null
    };
  }
};
