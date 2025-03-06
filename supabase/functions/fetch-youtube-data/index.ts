
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { fetchChannelDirectly } from './channelExtractors.ts';
import { fetchChannelViaVideo } from './channelExtractors.ts';
import { fetchChannelViaSearch } from './channelExtractors.ts';
import { formatChannelData } from './dataFormatters.ts';

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

    // Try different extraction methods
    let channel = null;
    let channelId = null;
    let error = null;

    // Method 1: Try direct channel extraction
    try {
      console.log(`[${now}] 🔍 Attempting direct channel extraction`);
      const result = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
      channel = result.channel;
      channelId = result.channelId;
      console.log(`[${now}] ✅ Direct extraction successful`);
    } catch (e) {
      console.log(`[${now}] ⚠️ Direct extraction failed:`, e.message);
      error = e;

      // Method 2: Try extraction via video
      if (url.includes('watch?v=') || url.includes('youtu.be')) {
        try {
          console.log(`[${now}] 🔍 Attempting extraction via video`);
          const result = await fetchChannelViaVideo(url, YOUTUBE_API_KEY);
          channel = result.channel;
          channelId = result.channelId;
          console.log(`[${now}] ✅ Video extraction successful`);
          error = null;
        } catch (e) {
          console.log(`[${now}] ⚠️ Video extraction failed:`, e.message);
          error = e;
        }
      }

      // Method 3: Last resort, try search
      if (!channel) {
        try {
          console.log(`[${now}] 🔍 Attempting extraction via search`);
          const result = await fetchChannelViaSearch(url, YOUTUBE_API_KEY);
          channel = result.channel;
          channelId = result.channelId;
          console.log(`[${now}] ✅ Search extraction successful`);
          error = null;
        } catch (e) {
          console.log(`[${now}] ⚠️ Search extraction failed:`, e.message);
          error = e;
        }
      }
    }

    if (!channel || !channelId) {
      throw error || new Error('Failed to extract channel data using all methods');
    }

    // Format channel data
    const channelData = formatChannelData(channel, channelId);
    
    console.log(`[${now}] ✅ Returning channel data for: ${channelData.title}`);
    
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
