
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

serve(async (req) => {
  console.log('Edge Function: fetch-top-videos invoked');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { channelId } = requestData;

    if (!channelId) {
      throw new Error('Channel ID is required');
    }

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured');
    }

    console.log(`Fetching top videos for channel ID: ${channelId}`);

    // Ensure correct case for YouTube channel ID (start with UC)
    const formattedChannelId = channelId.startsWith('uc') 
      ? 'UC' + channelId.substring(2) 
      : channelId;
      
    // Check if channelId is a YouTube channel ID
    const youtubeChannelIdPattern = /^UC[\w-]{21}[AQgw]$/i;
    if (!youtubeChannelIdPattern.test(formattedChannelId)) {
      // If not a YouTube channel ID, return a meaningful error
      console.error(`Invalid YouTube channel ID format: ${formattedChannelId}`);
      return new Response(JSON.stringify({
        error: "Not a valid YouTube channel ID. Please use the YouTube channel ID that starts with 'UC'."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Fetch videos sorted by view count (most viewed)
    const mostViewedVideosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${formattedChannelId}&maxResults=5&order=viewCount&type=video&key=${YOUTUBE_API_KEY}`
    );
    
    const mostViewedVideosData = await mostViewedVideosResponse.json();
    
    if (mostViewedVideosData.error) {
      console.error("YouTube API error:", mostViewedVideosData.error);
      throw new Error(`YouTube API error: ${mostViewedVideosData.error.message || JSON.stringify(mostViewedVideosData.error)}`);
    }
    
    if (!mostViewedVideosData.items || mostViewedVideosData.items.length === 0) {
      throw new Error('No videos found for this channel');
    }
    
    // Get video IDs for additional statistics
    const videoIds = mostViewedVideosData.items.map(item => item.id.videoId).join(',');
    
    // Fetch detailed statistics for these videos
    const videoStatsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    
    const videoStatsData = await videoStatsResponse.json();
    
    if (videoStatsData.error) {
      console.error("YouTube API error fetching stats:", videoStatsData.error);
      throw new Error(`YouTube API error fetching stats: ${videoStatsData.error.message || JSON.stringify(videoStatsData.error)}`);
    }
    
    // Process and combine the data
    const topVideos = videoStatsData.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      viewCount: parseInt(video.statistics.viewCount, 10),
      likeCount: parseInt(video.statistics.likeCount, 10) || 0,
      commentCount: parseInt(video.statistics.commentCount, 10) || 0,
      publishedAt: video.snippet.publishedAt
    }));
    
    // Sort by most viewed and most engaging (likes + comments)
    const mostViewed = [...topVideos].sort((a, b) => b.viewCount - a.viewCount);
    const mostEngaging = [...topVideos].sort((a, b) => 
      (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount)
    );
    
    return new Response(JSON.stringify({
      mostViewed: mostViewed.slice(0, 1)[0],
      mostEngaging: mostEngaging.slice(0, 1)[0]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
