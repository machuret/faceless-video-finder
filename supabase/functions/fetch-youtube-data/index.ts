
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const { url, videoId, channelId } = body;
    
    // Handle both URL and direct video ID cases
    let targetVideoId = videoId;
    
    // If we received a URL instead of a direct video ID, extract the video ID from the URL
    if (url && !targetVideoId) {
      // Extract video ID from YouTube URL
      console.log(`Parsing YouTube URL: ${url}`);
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname.includes('/watch')) {
          targetVideoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.includes('/channel/') || urlObj.pathname.includes('/c/') || urlObj.pathname.includes('/@')) {
          // This is a channel URL, use the path segment as the channel ID
          targetVideoId = urlObj.pathname.split('/').pop();
        }
      } else if (urlObj.hostname.includes('youtu.be')) {
        targetVideoId = urlObj.pathname.slice(1);
      }
      
      if (!targetVideoId) {
        return new Response(JSON.stringify({ error: 'Could not extract video/channel ID from URL' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (!targetVideoId) {
      return new Response(JSON.stringify({ error: 'No video ID provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Fetching data for video/channel ID: ${targetVideoId}`);

    // First try to get channel details using the video ID
    let channelUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${targetVideoId}&key=${YOUTUBE_API_KEY}`;
    console.log("Fetching video data from YouTube API...");
    
    let response = await fetch(channelUrl);
    let videoData = await response.json();
    
    let channelId, channelTitle, channelData;
    
    // If we got video data, extract the channel ID
    if (videoData.items && videoData.items.length > 0) {
      channelId = videoData.items[0].snippet.channelId;
      channelTitle = videoData.items[0].snippet.channelTitle;
      console.log(`Found channel ID: ${channelId} for video ID: ${targetVideoId}`);
      
      // Now get channel details using the channel ID
      channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      console.log("Fetching channel data from YouTube API...");
      
      response = await fetch(channelUrl);
      channelData = await response.json();
    } else {
      // If no video found, maybe targetVideoId is already a channel ID
      channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${targetVideoId}&key=${YOUTUBE_API_KEY}`;
      console.log("Trying to fetch channel data directly...");
      
      response = await fetch(channelUrl);
      channelData = await response.json();
    }
    
    if (channelData.error) {
      console.error("YouTube API Error:", channelData.error);
      return new Response(JSON.stringify({ error: `YouTube API error: ${channelData.error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!channelData.items || channelData.items.length === 0) {
      // Try searching for the channel if direct ID lookup failed
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(targetVideoId)}&type=channel&key=${YOUTUBE_API_KEY}`;
      console.log("Searching for channel...");
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.error) {
        console.error("YouTube API Search Error:", searchData.error);
        return new Response(JSON.stringify({ error: `YouTube API search error: ${searchData.error.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (!searchData.items || searchData.items.length === 0) {
        return new Response(JSON.stringify({ error: 'No channel found with that ID or name' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Use the first search result
      channelId = searchData.items[0].snippet.channelId;
      console.log(`Found channel ID via search: ${channelId}`);
      
      // Get full channel details
      channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      console.log("Fetching channel data from search result...");
      
      response = await fetch(channelUrl);
      channelData = await response.json();
      
      if (!channelData.items || channelData.items.length === 0) {
        return new Response(JSON.stringify({ error: 'Failed to get channel details from search result' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Extract the channel data
    const channel = channelData.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;
    
    // Format channel URL consistently
    const channel_url = `https://www.youtube.com/channel/${channel.id}`;
    
    // Get high-quality thumbnail if available
    let screenshot_url = null;
    if (snippet.thumbnails) {
      screenshot_url = snippet.thumbnails.high?.url || 
                      snippet.thumbnails.medium?.url || 
                      snippet.thumbnails.default?.url;
    }

    // Get channel creation date in YYYY-MM-DD format
    const publishedAt = snippet.publishedAt ? new Date(snippet.publishedAt).toISOString().split('T')[0] : null;
    
    // Prepare response data
    const channelInfo = {
      video_id: channel.id,
      channel_title: snippet.title,
      channel_url: channel_url,
      description: snippet.description,
      screenshot_url: screenshot_url,
      total_subscribers: statistics.subscriberCount ? parseInt(statistics.subscriberCount) : null,
      total_views: statistics.viewCount ? parseInt(statistics.viewCount) : null,
      video_count: statistics.videoCount ? parseInt(statistics.videoCount) : null,
      start_date: publishedAt
    };
    
    console.log("Extracted channel info:", channelInfo);
    
    // If channel ID was provided, fetch and update video stats
    if (channelId && body.channelId) {
      try {
        // Get the uploads playlist ID
        const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
        
        if (uploadsPlaylistId) {
          // Get videos from the uploads playlist
          const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=10&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`;
          console.log("Fetching playlist items from YouTube API...");
          
          const playlistResponse = await fetch(playlistUrl);
          const playlistData = await playlistResponse.json();
    
          if (playlistData.error) {
            console.error("YouTube API Error:", playlistData.error);
            // We don't want to fail the entire request if this part fails
            console.log("Continuing without video stats...");
          } else if (playlistData.items && playlistData.items.length > 0) {
            // Extract video IDs for stats
            const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
            const videoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
            console.log("Fetching video statistics from YouTube API...");
            
            const videoStatsResponse = await fetch(videoStatsUrl);
            const videoStatsData = await videoStatsResponse.json();
    
            if (!videoStatsData.error && videoStatsData.items && videoStatsData.items.length > 0) {
              // Process video stats
              console.log("Preparing video stats data for database...");
              const videoStats = videoStatsData.items.map(video => ({
                video_id: video.id,
                title: video.snippet.title,
                thumbnail_url: video.snippet.thumbnails.medium.url,
                views: parseInt(video.statistics.viewCount, 10),
                likes: video.statistics.likeCount ? parseInt(video.statistics.likeCount, 10) : 0,
                channel_id: body.channelId
              }));
    
              // Save to Supabase
              console.log("Saving video stats to Supabase...");
              
              // First, delete any existing stats for this channel
              const { error: deleteError } = await supabase
                .from('youtube_video_stats')
                .delete()
                .eq('channel_id', body.channelId);
                
              if (deleteError) {
                console.error("Error deleting existing video stats:", deleteError);
              } else {
                // Then insert the new stats
                const { error: insertError } = await supabase
                  .from('youtube_video_stats')
                  .insert(videoStats);
                  
                if (insertError) {
                  console.error("Error inserting video stats:", insertError);
                } else {
                  console.log(`Successfully saved ${videoStats.length} video stats to the database`);
                }
              }
            }
          }
        }
      } catch (statsError) {
        console.error("Error processing video stats:", statsError);
        // Continue without video stats
      }
    }
    
    return new Response(JSON.stringify(channelInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
