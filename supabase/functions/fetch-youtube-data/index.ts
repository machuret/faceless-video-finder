
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
  // Initial request logging
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Edge Function: fetch-youtube-data invoked`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`👉 [${timestamp}] Handling CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body with error handling
    let requestData;
    try {
      requestData = await req.json();
      console.log(`📨 [${timestamp}] Received request data:`, JSON.stringify(requestData));
    } catch (error) {
      console.error(`❌ [${timestamp}] Failed to parse request body:`, error);
      throw new Error('Invalid request body');
    }

    const { url } = requestData;

    if (!url) {
      console.error(`❌ [${timestamp}] URL is required but was empty`);
      throw new Error('URL is required');
    }

    console.log(`🔍 [${timestamp}] Processing URL: ${url}`);

    if (!YOUTUBE_API_KEY) {
      console.error(`❌ [${timestamp}] YouTube API key is not configured in environment variables`);
      throw new Error('YouTube API key is not configured');
    }

    // Try all methods in sequence until we get data
    let channelData = null;
    let extractionMethod = '';
    
    const methods = [
      { name: 'Direct Channel Method', fn: (u: string) => fetchChannelDirectly(u, YOUTUBE_API_KEY!) },
      { name: 'Video Method', fn: (u: string) => fetchChannelViaVideo(u, YOUTUBE_API_KEY!) },
      { name: 'Search Method', fn: (u: string) => fetchChannelViaSearch(u, YOUTUBE_API_KEY!) }
    ];
    
    // Try each method until one succeeds
    for (const method of methods) {
      try {
        console.log(`🔄 [${timestamp}] Trying ${method.name} for URL: ${url}`);
        const result = await method.fn(url);
        
        if (result && result.channel) {
          extractionMethod = method.name;
          console.log(`✅ [${timestamp}] Successfully extracted data using ${method.name}`);
          
          // Format the channel data
          channelData = formatChannelData(result.channel, result.channelId);
          break;
        }
      } catch (error) {
        console.log(`❌ [${timestamp}] ${method.name} failed: ${error.message}`);
        console.error('Detailed error:', error);
      }
    }

    if (!channelData) {
      console.error(`❌ [${timestamp}] All extraction methods failed`);
      throw new Error('Could not extract channel information from URL using any method');
    }

    console.log(`✅ [${timestamp}] Returning channel data for "${channelData.title}" using ${extractionMethod}`);
    
    return new Response(JSON.stringify({ channelData, extractionMethod }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] Error in fetch-youtube-data:`, error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: timestamp
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
