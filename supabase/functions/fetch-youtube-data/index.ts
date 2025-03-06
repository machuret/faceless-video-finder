
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

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

    // For testing purposes, return mock data
    const mockChannelData = {
      title: "Test Channel",
      description: "This is a test channel description",
      thumbnailUrl: "https://example.com/thumbnail.jpg",
      subscriberCount: 1000,
      viewCount: 50000,
      videoCount: 100,
      publishedAt: "2021-01-01T00:00:00Z",
      country: "US",
      channelId: "UC123456789",
      url: url,
      channelType: "creator",
      keywords: ["test", "channel"]
    };

    console.log('✅ Returning mock channel data for testing');
    
    return new Response(JSON.stringify({ channelData: mockChannelData }), {
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
