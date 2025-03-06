
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { fetchChannelDirectly } from './channelExtractors.ts';
import { fetchChannelViaVideo } from './channelExtractors.ts';
import { fetchChannelViaSearch } from './channelExtractors.ts';
import { formatChannelData } from './dataFormatters.ts';
import { createMockChannelData } from './mockData.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Global timeout controller to prevent hanging requests
const TIMEOUT_MS = 25000; // 25 second timeout

serve(async (req) => {
  // Create an AbortController for the entire request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.error(`Request timed out after ${TIMEOUT_MS}ms`);
  }, TIMEOUT_MS);

  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('[CORS] Handling OPTIONS request');
      clearTimeout(timeoutId);
      return new Response(null, { headers: corsHeaders });
    }

    const now = new Date().toISOString();
    console.log(`[${now}] 🚀 Edge function called`);

    let requestBody;
    try {
      // Parse request body with error handling
      requestBody = await req.json();
      console.log(`[${now}] 📝 Request body:`, JSON.stringify(requestBody));
    } catch (parseError) {
      console.error(`[${now}] ❌ Failed to parse request body:`, parseError);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body", 
          timestamp: now,
          success: false 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle test ping
    if (requestBody?.test === true) {
      console.log(`[${now}] 🧪 Test request received with timestamp: ${requestBody.timestamp}`);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          message: "Edge function is working correctly", 
          receivedAt: now,
          requestTimestamp: requestBody.timestamp,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for mock data request
    if (requestBody?.allowMockData === true && requestBody?.url) {
      console.log(`[${now}] 🧪 Returning mock data for URL: ${requestBody.url}`);
      const mockData = createMockChannelData(requestBody.url);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          channelData: mockData,
          isMockData: true,
          timestamp: now,
          success: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate YouTube API key
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error(`[${now}] ❌ YouTube API key not configured`);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: 'YouTube API key not configured on the server. Please check edge function configuration.',
          timestamp: now,
          success: false 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    console.log(`[${now}] 🔑 API Key exists and is properly configured`);

    // Validate URL
    const url = requestBody?.url;
    if (!url) {
      console.error(`[${now}] ❌ URL is required but was not provided`);
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: 'URL is required',
          timestamp: now,
          success: false 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    console.log(`[${now}] 📝 Processing URL:`, url);

    // Try different extraction methods
    let channel = null;
    let channelId = null;
    let error = null;
    let extractionMethod = "none";

    try {
      // Method 1: Try direct channel extraction
      console.log(`[${now}] 🔍 Attempting direct channel extraction`);
      const result = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
      channel = result.channel;
      channelId = result.channelId;
      extractionMethod = "direct";
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
          extractionMethod = "video";
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
          extractionMethod = "search";
          console.log(`[${now}] ✅ Search extraction successful`);
          error = null;
        } catch (e) {
          console.log(`[${now}] ⚠️ Search extraction failed:`, e.message);
          error = e;
        }
      }
    }

    if (!channel || !channelId) {
      const errorMessage = error ? error.message : 'Failed to extract channel data using all methods';
      console.error(`[${now}] ❌ ${errorMessage}`);
      
      // For development purposes, return mock data if real extraction fails
      if (requestBody?.allowMockData === true) {
        console.log(`[${now}] 🧪 Returning mock data as fallback`);
        const mockData = createMockChannelData(url);
        clearTimeout(timeoutId);
        return new Response(
          JSON.stringify({ 
            channelData: mockData,
            isMockData: true,
            error: errorMessage,
            timestamp: now,
            success: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          timestamp: now,
          success: false 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format channel data
    const channelData = formatChannelData(channel, channelId);
    
    console.log(`[${now}] ✅ Returning channel data for: ${channelData.title} (extraction method: ${extractionMethod})`);
    
    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({ 
        channelData,
        extractionMethod,
        timestamp: now,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Unhandled error:`, error.message);
    console.error(`[${timestamp}] Stack trace:`, error.stack);
    
    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown server error',
        stack: error.stack, // Include stack trace for better debugging
        timestamp,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } finally {
    // Clear the timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
});
