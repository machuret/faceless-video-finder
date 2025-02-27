
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
    
    const { videoId, channelId } = body;
    
    if (!videoId) {
      return new Response(JSON.stringify({ error: 'No video ID provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!channelId) {
      return new Response(JSON.stringify({ error: 'No channel ID provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Fetching data for video ID: ${videoId}, channel ID: ${channelId}`);

    // Fetch channel details from YouTube API
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    console.log("Fetching channel data from YouTube API...");
    
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();
    
    if (channelData.error) {
      console.error("YouTube API Error:", channelData.error);
      return new Response(JSON.stringify({ error: `YouTube API error: ${channelData.error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!channelData.items || channelData.items.length === 0) {
      console.log("No channel found with that ID");
      return new Response(JSON.stringify({ error: 'No channel found with that ID' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the uploads playlist ID
    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      return new Response(JSON.stringify({ error: 'Could not find uploads playlist for this channel' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get videos from the uploads playlist
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=10&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`;
    console.log("Fetching playlist items from YouTube API...");
    
    const playlistResponse = await fetch(playlistUrl);
    const playlistData = await playlistResponse.json();

    if (playlistData.error) {
      console.error("YouTube API Error:", playlistData.error);
      return new Response(JSON.stringify({ error: `YouTube API error: ${playlistData.error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!playlistData.items || playlistData.items.length === 0) {
      return new Response(JSON.stringify({ error: 'No videos found for this channel' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract video IDs for stats
    const videoIds = playlistData.items.map(item => item.contentDetails.videoId).join(',');
    const videoStatsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    console.log("Fetching video statistics from YouTube API...");
    
    const videoStatsResponse = await fetch(videoStatsUrl);
    const videoStatsData = await videoStatsResponse.json();

    if (videoStatsData.error) {
      console.error("YouTube API Error:", videoStatsData.error);
      return new Response(JSON.stringify({ error: `YouTube API error: ${videoStatsData.error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process video stats
    console.log("Preparing video stats data for database...");
    const videoStats = videoStatsData.items.map(video => ({
      video_id: video.id,
      title: video.snippet.title,
      thumbnail_url: video.snippet.thumbnails.medium.url,
      views: parseInt(video.statistics.viewCount, 10),
      likes: video.statistics.likeCount ? parseInt(video.statistics.likeCount, 10) : 0,
      channel_id: channelId
    }));

    // Save to Supabase
    console.log("Saving video stats to Supabase...");
    
    // First, delete any existing stats for this channel
    const { error: deleteError } = await supabase
      .from('youtube_video_stats')
      .delete()
      .eq('channel_id', channelId);
      
    if (deleteError) {
      console.error("Error deleting existing video stats:", deleteError);
      return new Response(JSON.stringify({ error: `Database error: ${deleteError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Then insert the new stats
    const { error: insertError } = await supabase
      .from('youtube_video_stats')
      .insert(videoStats);
      
    if (insertError) {
      console.error("Error inserting video stats:", insertError);
      return new Response(JSON.stringify({ error: `Database error: ${insertError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Successfully saved ${videoStats.length} video stats to the database`);
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully saved ${videoStats.length} video stats`,
      videoStats
    }), {
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
