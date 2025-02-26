
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from '../_shared/cors.ts'

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

async function extractVideoIdFromUrl(url: string) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/channel\/([^&\n?#]+)/,
    /youtube\.com\/@([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  throw new Error('Invalid YouTube URL format');
}

async function fetchYouTubeData(videoId: string) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Try channel ID first
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${await channelResponse.text()}`);
    }

    const channelData = await channelResponse.json();
    
    if (channelData.items && channelData.items.length > 0) {
      const channel = channelData.items[0];
      return {
        video_id: channel.id,
        channel_title: channel.snippet.title,
        channel_url: `https://youtube.com/channel/${channel.id}`,
        description: channel.snippet.description,
        screenshot_url: channel.snippet.thumbnails?.high?.url || null,
        total_subscribers: parseInt(channel.statistics.subscriberCount) || null,
        total_views: parseInt(channel.statistics.viewCount) || null,
        start_date: channel.snippet.publishedAt,
        video_count: parseInt(channel.statistics.videoCount) || null,
      };
    }

    // If channel ID doesn't work, try username
    const userResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forUsername=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!userResponse.ok) {
      throw new Error(`YouTube API error: ${await userResponse.text()}`);
    }

    const userData = await userResponse.json();
    
    if (userData.items && userData.items.length > 0) {
      const channel = userData.items[0];
      return {
        video_id: channel.id,
        channel_title: channel.snippet.title,
        channel_url: `https://youtube.com/channel/${channel.id}`,
        description: channel.snippet.description,
        screenshot_url: channel.snippet.thumbnails?.high?.url || null,
        total_subscribers: parseInt(channel.statistics.subscriberCount) || null,
        total_views: parseInt(channel.statistics.viewCount) || null,
        start_date: channel.snippet.publishedAt,
        video_count: parseInt(channel.statistics.videoCount) || null,
      };
    }

    throw new Error('Channel not found');
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const videoId = await extractVideoIdFromUrl(url)
    const data = await fetchYouTubeData(videoId)

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
