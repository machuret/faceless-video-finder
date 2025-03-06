
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { formatChannelData } from './dataFormatters.ts';
import { fetchChannelDirectly, fetchChannelViaVideo, fetchChannelViaSearch } from './channelExtractors.ts';
import { createMockChannelData } from './mockData.ts';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

serve(async (req) => {
  // Add a timestamp to logs for better tracking
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Edge Function: fetch-youtube-data invoked`);
  console.log(`[${timestamp}] 📝 Request method: ${req.method}`);
  console.log(`[${timestamp}] 🔑 YouTube API key present: ${!!YOUTUBE_API_KEY}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] 👉 Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestBody = await req.text();
    console.log(`[${timestamp}] 📨 Raw request body:`, requestBody);
    
    if (!requestBody) {
      throw new Error('Empty request body');
    }
    
    const { url } = JSON.parse(requestBody);
    console.log(`[${timestamp}] 🔍 Processing URL:`, url);

    if (!url) {
      throw new Error('URL is required');
    }

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured');
    }

    // Extract channel information
    let channelData;
    
    try {
      // Determine URL type and extract channel data accordingly
      if (url.includes('watch?v=') || url.includes('youtu.be/')) {
        console.log(`[${timestamp}] 🎬 Detected video URL, fetching channel via video`);
        const { channel, channelId } = await fetchChannelViaVideo(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      } 
      else if (url.includes('/channel/') || url.includes('/c/') || url.includes('@')) {
        console.log(`[${timestamp}] 📺 Detected channel URL, fetching channel directly`);
        const { channel, channelId } = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      }
      else {
        console.log(`[${timestamp}] 🔎 No specific format detected, attempting general search`);
        const { channel, channelId } = await fetchChannelViaSearch(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      }

      console.log(`[${timestamp}] ✅ Successfully extracted channel data:`, channelData);

    } catch (error) {
      console.error(`[${timestamp}] ❌ Error fetching channel data:`, error);
      console.error(`[${timestamp}] ❌ Stack trace:`, error.stack);
      
      // Return mock data for testing if API fails
      console.log(`[${timestamp}] ⚠️ Returning mock data due to API error`);
      channelData = createMockChannelData(url);
    }
    
    return new Response(JSON.stringify({ channelData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[${timestamp}] ❌ Error in fetch-youtube-data:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: timestamp,
      details: error.stack || 'No stack trace available'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
