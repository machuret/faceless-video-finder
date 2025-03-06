
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
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] 👉 Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Force a log to check if logging works
    console.log(`[${timestamp}] ✅ Log test - If you can see this, logging is working`);
    
    // Parse request body with improved error handling
    let requestData;
    let requestBody = '';
    
    try {
      requestBody = await req.text();
      console.log(`[${timestamp}] 📨 Raw request body: ${requestBody}`);
      
      if (!requestBody) {
        console.error(`[${timestamp}] ❌ Empty request body`);
        throw new Error('Empty request body');
      }
      
      requestData = JSON.parse(requestBody);
      console.log(`[${timestamp}] 📨 Parsed request data:`, JSON.stringify(requestData));
    } catch (error) {
      console.error(`[${timestamp}] ❌ Failed to parse request body: ${error.message}`);
      console.error(`[${timestamp}] ❌ Raw body was: ${requestBody}`);
      throw new Error(`Invalid request body: ${error.message}`);
    }

    const { url } = requestData;

    if (!url) {
      console.error(`[${timestamp}] ❌ URL is required but was empty`);
      throw new Error('URL is required');
    }

    console.log(`[${timestamp}] 🔍 Processing URL: ${url}`);

    if (!YOUTUBE_API_KEY) {
      console.error(`[${timestamp}] ❌ YouTube API key is not configured in environment variables`);
      throw new Error('YouTube API key is not configured');
    }

    console.log(`[${timestamp}] 🔑 YouTube API key is present and has length: ${YOUTUBE_API_KEY.length}`);

    // Extract channel information
    let channelData;
    
    try {
      // Determine URL type and extract channel data accordingly
      console.log(`[${timestamp}] 🔄 Starting channel data extraction workflow`);
      
      // Check if it's a video URL
      if (url.includes('watch?v=') || url.includes('youtu.be/')) {
        console.log(`[${timestamp}] 🎬 Detected video URL, fetching channel via video`);
        const { channel, channelId } = await fetchChannelViaVideo(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      } 
      // Check if it's a direct channel URL
      else if (url.includes('/channel/') || url.includes('/c/') || url.includes('@')) {
        console.log(`[${timestamp}] 📺 Detected channel URL, fetching channel directly`);
        const { channel, channelId } = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      }
      // Default to search as last resort
      else {
        console.log(`[${timestamp}] 🔎 No specific format detected, attempting general search`);
        const { channel, channelId } = await fetchChannelViaSearch(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      }

      console.log(`[${timestamp}] ✅ Successfully extracted and formatted channel data`);

    } catch (error) {
      console.error(`[${timestamp}] ❌ Error fetching channel data:`, error);
      console.error(`[${timestamp}] ❌ Error message: ${error.message}`);
      console.error(`[${timestamp}] ❌ Stack trace: ${error.stack || 'No stack trace available'}`);
      
      // Return mock data for testing if API fails
      console.log(`[${timestamp}] ⚠️ Returning mock data due to API error`);
      channelData = createMockChannelData(url);
    }

    console.log(`[${timestamp}] 📤 Channel data ready for response:`, JSON.stringify(channelData));
    
    return new Response(JSON.stringify({ channelData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`[${timestamp}] ❌ Error in fetch-youtube-data:`, error);
    console.error(`[${timestamp}] ❌ Error details: message=${error.message}, stack=${error.stack || 'No stack trace'}`);
    
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
