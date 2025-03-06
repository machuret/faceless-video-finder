
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { 
  fetchChannelDirectly, 
  fetchChannelViaVideo, 
  fetchChannelViaSearch 
} from './channelExtractors.ts';
import { formatChannelData } from './dataFormatters.ts';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Create Supabase client
const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

serve(async (req) => {
  console.log('🚀 Edge Function: fetch-youtube-data invoked');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { url } = requestData;

    console.log(`📌 Received request with URL: ${url}`);

    if (!url) {
      console.error('❌ URL is required but was empty');
      throw new Error('URL is required');
    }

    if (!YOUTUBE_API_KEY) {
      console.error('❌ YouTube API key is not configured in environment variables');
      throw new Error('YouTube API key is not configured');
    }

    console.log(`🔍 Processing URL: ${url}`);
    
    // Try all methods in sequence until we get data
    let channelData = null;
    let extractionMethod = "";
    
    const methods = [
      { name: "Direct Channel Method", fn: (u: string) => fetchChannelDirectly(u, YOUTUBE_API_KEY) },
      { name: "Video Method", fn: (u: string) => fetchChannelViaVideo(u, YOUTUBE_API_KEY) },
      { name: "Search Method", fn: (u: string) => fetchChannelViaSearch(u, YOUTUBE_API_KEY) }
    ];
    
    // Try each method until one succeeds
    for (const method of methods) {
      try {
        console.log(`🔄 Trying ${method.name} for URL: ${url}`);
        const result = await method.fn(url);
        
        if (result && result.channel) {
          extractionMethod = method.name;
          console.log(`✅ Successfully extracted data using ${method.name}`);
          
          // Format the channel data
          channelData = formatChannelData(result.channel, result.channelId);
          break;
        }
      } catch (error) {
        console.log(`❌ ${method.name} failed: ${error.message}, trying next method`);
      }
    }
    
    if (!channelData) {
      console.error('❌ All extraction methods failed. Could not extract channel information.');
      throw new Error('Could not extract channel information from URL using any method');
    }
    
    console.log(`✅ Successfully fetched channel data for "${channelData.title}" using ${extractionMethod}`);
    console.log(`📊 Channel stats: ${channelData.subscriberCount} subscribers, ${channelData.videoCount} videos`);
    
    return new Response(JSON.stringify({ channelData, extractionMethod }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error in fetch-youtube-data:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
