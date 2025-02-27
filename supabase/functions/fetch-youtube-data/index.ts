
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getChannelId(url: string): Promise<string> {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    let handle = '';
    
    // Direct channel ID
    if (path.includes('/channel/')) {
      return path.split('/channel/')[1].split('/')[0];
    }

    // Handle other formats (username, custom URL, or handle)
    if (path.includes('/user/')) {
      handle = path.split('/user/')[1].split('/')[0];
    } else if (path.includes('/c/')) {
      handle = path.split('/c/')[1].split('/')[0];
    } else if (path.includes('@')) {
      handle = path.split('@')[1].split('/')[0];
    } else {
      throw new Error('Invalid YouTube URL format');
    }

    // Search for channel by handle/username
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${YOUTUBE_API_KEY}`
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      throw new Error(`YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items?.length) {
      throw new Error('Channel not found');
    }

    return searchData.items[0].snippet.channelId;
  } catch (error) {
    console.error('Error getting channel ID:', error);
    throw error;
  }
}

serve(async (req) => {
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
    const channelId = await getChannelId(url);
    console.log('Found channel ID:', channelId);

    // Get channel info
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
      throw new Error('Channel not found');
    }

    const channel = channelData.items[0];
    const channelSnippet = channel.snippet;
    const channelStats = channel.statistics;

    // Get recent videos to check activity
    const uploadsPlaylistId = `UU${channelId.slice(2)}`;
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      console.error('YouTube API error (videos):', errorData);
      throw new Error(`Failed to fetch videos: ${errorData.error?.message || 'Unknown error'}`);
    }

    const videosData = await videosResponse.json();
    console.log('Videos found:', videosData.items?.length || 0);

    // Format response data
    const responseData = {
      video_id: channelId,
      channel_title: channelSnippet.title,
      channel_url: `https://youtube.com/channel/${channelId}`,
      description: channelSnippet.description,
      screenshot_url: channelSnippet.thumbnails?.default?.url || '',
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
