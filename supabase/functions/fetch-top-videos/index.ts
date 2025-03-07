
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

    console.log(`Fetching top and latest videos for channel ID: ${channelId}`);

    // Check if channelId is a YouTube channel ID
    const youtubeChannelIdPattern = /^UC[\w-]{21}[AQgw]$/;
    if (!youtubeChannelIdPattern.test(channelId)) {
      // If not a YouTube channel ID, try to get it from our database channel title
      // For now, just return a meaningful error
      return new Response(JSON.stringify({
        error: "Not a valid YouTube channel ID. Please use the YouTube channel ID that starts with 'UC'."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Fetch videos sorted by view count (most viewed)
    const mostViewedVideosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=5&order=viewCount&type=video&key=${YOUTUBE_API_KEY}`
    );
    
    const mostViewedVideosData = await mostViewedVideosResponse.json();
    
    if (!mostViewedVideosData.items || mostViewedVideosData.items.length === 0) {
      throw new Error('No videos found for this channel');
    }
    
    // Get video IDs for additional statistics for most viewed
    const viewedVideoIds = mostViewedVideosData.items.map(item => item.id.videoId).join(',');
    
    // Fetch detailed statistics for these videos
    const viewedVideoStatsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${viewedVideoIds}&key=${YOUTUBE_API_KEY}`
    );
    
    const viewedVideoStatsData = await viewedVideoStatsResponse.json();
    
    // Process and combine the data for most viewed
    const topViewedVideos = viewedVideoStatsData.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      viewCount: parseInt(video.statistics.viewCount, 10),
      likeCount: parseInt(video.statistics.likeCount, 10) || 0,
      commentCount: parseInt(video.statistics.commentCount, 10) || 0,
      publishedAt: video.snippet.publishedAt
    }));
    
    // Fetch latest videos
    const latestVideosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=5&order=date&type=video&key=${YOUTUBE_API_KEY}`
    );
    
    const latestVideosData = await latestVideosResponse.json();
    
    if (!latestVideosData.items || latestVideosData.items.length === 0) {
      throw new Error('No latest videos found for this channel');
    }
    
    // Get video IDs for additional statistics for latest videos
    const latestVideoIds = latestVideosData.items.map(item => item.id.videoId).join(',');
    
    // Fetch detailed statistics for these videos
    const latestVideoStatsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${latestVideoIds}&key=${YOUTUBE_API_KEY}`
    );
    
    const latestVideoStatsData = await latestVideoStatsResponse.json();
    
    // Process and combine the data for latest videos
    const latestVideos = latestVideoStatsData.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      viewCount: parseInt(video.statistics.viewCount, 10),
      likeCount: parseInt(video.statistics.likeCount, 10) || 0,
      commentCount: parseInt(video.statistics.commentCount, 10) || 0,
      publishedAt: video.snippet.publishedAt
    }));
    
    // Sort by most viewed and most engaging (likes + comments)
    const mostViewed = [...topViewedVideos].sort((a, b) => b.viewCount - a.viewCount);
    const mostEngaging = [...topViewedVideos].sort((a, b) => 
      (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount)
    );
    
    return new Response(JSON.stringify({
      mostViewed: mostViewed.slice(0, 1)[0],
      mostEngaging: mostEngaging.slice(0, 1)[0],
      latestVideos: latestVideos.slice(0, 3) // Return top 3 latest videos
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
