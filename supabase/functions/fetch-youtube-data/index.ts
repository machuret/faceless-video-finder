
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date().toISOString();
    console.log(`[${now}] 🚀 Edge function called`);

    // Get YouTube API key
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    console.log(`[${now}] 🔑 API Key exists:`, !!YOUTUBE_API_KEY);

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Parse request body
    const body = await req.json();
    const url = body?.url;
    console.log(`[${now}] 📝 Received URL:`, url);

    if (!url) {
      throw new Error('URL is required');
    }

    // Extract channel info from URL
    let channelId = null;

    // Handle different URL formats
    if (url.includes('/channel/')) {
      channelId = url.match(/\/channel\/(UC[\w-]{21,24})/)?.[1];
    } else if (url.includes('@')) {
      const username = url.match(/\/@([^\/\?]+)/)?.[1] || url.match(/@([^\/\?\s]+)/)?.[1];
      if (username) {
        // Search for channel by username
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${username}&type=channel&key=${YOUTUBE_API_KEY}`
        );
        const searchData = await searchResponse.json();
        channelId = searchData?.items?.[0]?.id?.channelId;
      }
    }

    console.log(`[${now}] 🎯 Found channel ID:`, channelId);

    if (!channelId) {
      throw new Error('Could not find channel ID from URL');
    }

    // Fetch channel data
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();
    console.log(`[${now}] 📊 API Response:`, JSON.stringify(data));

    if (!data.items?.length) {
      throw new Error('Channel not found');
    }

    const channel = data.items[0];
    const channelData = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
      viewCount: parseInt(channel.statistics.viewCount || '0'),
      videoCount: parseInt(channel.statistics.videoCount || '0'),
      publishedAt: channel.snippet.publishedAt,
      url: `https://youtube.com/channel/${channel.id}`,
      country: channel.snippet.country || '',
    };

    console.log(`[${now}] ✅ Returning channel data`);
    
    return new Response(
      JSON.stringify({ channelData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error:`, error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
