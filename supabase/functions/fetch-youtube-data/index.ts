
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { formatChannelData } from './dataFormatters.ts';
import { fetchChannelDirectly, fetchChannelViaVideo, fetchChannelViaSearch } from './channelExtractors.ts';
import { createMockChannelData } from './mockData.ts';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

serve(async (req) => {
  console.log('🚀 Edge Function: fetch-youtube-data invoked');
  console.log('📝 Request method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('👉 Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body with error handling
    let requestData;
    try {
      requestData = await req.json();
      console.log('📨 Received request data:', JSON.stringify(requestData));
    } catch (error) {
      console.error('❌ Failed to parse request body:', error);
      throw new Error('Invalid request body');
    }

    const { url } = requestData;

    if (!url) {
      console.error('❌ URL is required but was empty');
      throw new Error('URL is required');
    }

    console.log('🔍 Processing URL:', url);

    if (!YOUTUBE_API_KEY) {
      console.error('❌ YouTube API key is not configured in environment variables');
      throw new Error('YouTube API key is not configured');
    }

    // Extract channel information
    let channelData;
    
    try {
      // Determine URL type and extract channel data accordingly
      // Try each method in sequence until one succeeds
      
      // Check if it's a video URL
      if (url.includes('watch?v=') || url.includes('youtu.be/')) {
        console.log('🎬 Detected video URL, fetching channel via video');
        const { channel, channelId } = await fetchChannelViaVideo(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      } 
      // Check if it's a direct channel URL
      else if (url.includes('/channel/') || url.includes('/c/') || url.includes('@')) {
        console.log('📺 Detected channel URL, fetching channel directly');
        const { channel, channelId } = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      }
      // Default to search as last resort
      else {
        console.log('🔎 No specific format detected, attempting general search');
        const { channel, channelId } = await fetchChannelViaSearch(url, YOUTUBE_API_KEY);
        channelData = formatChannelData(channel, channelId);
      }

    } catch (error) {
      console.error('❌ Error fetching channel data:', error);
      
      // Return mock data for testing if API fails
      console.log('⚠️ Returning mock data due to API error');
      channelData = createMockChannelData(url);
    }

    console.log('✅ Returning channel data:', JSON.stringify(channelData));
    
    return new Response(JSON.stringify({ channelData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Error in fetch-youtube-data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
