
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { channelId } = await req.json();

    // Get channel data from our database
    const { data: channel, error: channelError } = await supabase
      .from('youtube_channels')
      .select('video_id')
      .eq('id', channelId)
      .single();

    if (channelError || !channel) {
      console.error('Error fetching channel:', channelError);
      throw new Error('Channel not found');
    }

    // Get channel videos from YouTube API
    const playlistId = `UU${channel.video_id.slice(2)}`; // Convert video ID to uploads playlist ID
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos from YouTube API');
    }

    const videosData = await videosResponse.json();
    const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

    // Get video statistics from YouTube API
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    if (!statsResponse.ok) {
      throw new Error('Failed to fetch video statistics from YouTube API');
    }

    const statsData = await statsResponse.json();

    // Prepare video stats for database
    const videoStats = statsData.items.map((item: any) => {
      const video = videosData.items.find(
        (v: any) => v.snippet.resourceId.videoId === item.id
      );
      
      return {
        channel_id: channelId,
        video_id: item.id,
        title: video.snippet.title,
        thumbnail_url: video.snippet.thumbnails.default.url,
        views: parseInt(item.statistics.viewCount) || 0,
        likes: parseInt(item.statistics.likeCount) || 0,
      };
    });

    // Upsert video stats to our database
    const { error: upsertError } = await supabase
      .from('youtube_video_stats')
      .upsert(videoStats, {
        onConflict: 'channel_id,video_id',
      });

    if (upsertError) {
      console.error('Error upserting video stats:', upsertError);
      throw new Error('Failed to save video statistics');
    }

    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred'
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
