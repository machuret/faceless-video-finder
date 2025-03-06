
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
const TIMEOUT_MS = 15000; // 15 second timeout - reduced from 20s

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  const now = new Date().toISOString();
  console.log(`[${now}] 🚀 Edge function called`);

  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`[${now}] 📝 Request body:`, JSON.stringify(requestBody));
    } catch (parseError) {
      console.error(`[${now}] ❌ Failed to parse request body:`, parseError);
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

    // Simple approach: try one extraction method at a time with proper timeout
    try {
      console.log(`[${now}] 🔍 Attempting channel extraction with simplified approach`);
      
      // Try direct extraction first
      let channel = null;
      let channelId = null;
      let extractionMethod = "direct";
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const result = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
        clearTimeout(timeoutId);
        
        channel = result.channel;
        channelId = result.channelId;
      } catch (directError) {
        console.log(`[${now}] ⚠️ Direct extraction failed:`, directError.message);
        
        // If URL looks like a video, try video extraction
        if (url.includes('watch?v=') || url.includes('youtu.be')) {
          try {
            extractionMethod = "video";
            console.log(`[${now}] 🔍 Attempting extraction via video`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const result = await fetchChannelViaVideo(url, YOUTUBE_API_KEY);
            clearTimeout(timeoutId);
            
            channel = result.channel;
            channelId = result.channelId;
          } catch (videoError) {
            console.log(`[${now}] ⚠️ Video extraction failed:`, videoError.message);
          }
        }
        
        // If still no result, try search as last resort
        if (!channel) {
          try {
            extractionMethod = "search";
            console.log(`[${now}] 🔍 Attempting extraction via search`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const result = await fetchChannelViaSearch(url, YOUTUBE_API_KEY);
            clearTimeout(timeoutId);
            
            channel = result.channel;
            channelId = result.channelId;
          } catch (searchError) {
            console.log(`[${now}] ⚠️ Search extraction failed:`, searchError.message);
          }
        }
      }
      
      // If no channel data found, return error or mock data
      if (!channel || !channelId) {
        console.error(`[${now}] ❌ Failed to extract channel data using all methods`);
        
        // For development purposes, return mock data if real extraction fails
        if (requestBody?.allowMockData === true) {
          console.log(`[${now}] 🧪 Returning mock data as fallback`);
          const mockData = createMockChannelData(url);
          return new Response(
            JSON.stringify({ 
              channelData: mockData,
              isMockData: true,
              error: "Failed to extract channel data",
              timestamp: now,
              success: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: "Failed to extract channel data using all methods",
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
      console.error(`[${now}] ❌ Error during channel extraction:`, error.message);
      
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Error extracting channel data',
          timestamp: now,
          success: false
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ Unhandled error:`, error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown server error',
        timestamp,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
