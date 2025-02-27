
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

function extractChannelId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different YouTube URL formats
    if (url.includes('/channel/')) {
      return url.split('/channel/')[1].split('/')[0];
    } else if (url.includes('/user/')) {
      return url.split('/user/')[1].split('/')[0];
    } else if (url.includes('@')) {
      return url.split('@')[1].split('/')[0];
    } else if (url.includes('/c/')) {
      return url.split('/c/')[1].split('/')[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting fetch-youtube-data function');
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Processing URL:', url);
    const channelId = extractChannelId(url);
    
    if (!channelId) {
      throw new Error('Could not extract channel ID from URL');
    }

    console.log('Extracted channel ID:', channelId);

    // First, try to get channel info
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    if (!channelResponse.ok) {
      const errorData = await channelResponse.json();
      console.error('YouTube API error:', errorData);
      throw new Error(`YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items?.length) {
      console.log('No channel found with ID:', channelId);
      throw new Error('Channel not found');
    }

    const channel = channelData.items[0];
    const channelSnippet = channel.snippet;
    const channelStats = channel.statistics;

    // Get the channel's uploads playlist ID
    const uploadsPlaylistId = `UU${channelId.slice(2)}`;

    // Get recent videos
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error('YouTube API error (videos):', errorData);
      throw new Error(`Failed to fetch videos: ${errorData.error?.message || 'Unknown error'}`);
    }

    const videosData = await videosResponse.json();

    // Format response data
    const responseData = {
      video_id: channelId,
      channel_title: channelSnippet.title,
      channel_url: `https://youtube.com/channel/${channelId}`,
      description: channelSnippet.description,
      screenshot_url: channelSnippet.thumbnails.default.url,
      total_subscribers: parseInt(channelStats.subscriberCount) || 0,
      total_views: parseInt(channelStats.viewCount) || 0,
      start_date: channelSnippet.publishedAt,
      video_count: parseInt(channelStats.videoCount) || 0,
    };

    console.log('Returning data:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in fetch-youtube-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
