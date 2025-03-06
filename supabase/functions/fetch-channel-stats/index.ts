
// Follow Edge Function format
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Create a response helper function
const createResponse = (body: any, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// Main function to fetch channel stats
async function fetchChannelStats(channelId: string, apiKey: string) {
  console.log(`Fetching stats for channel ID: ${channelId}`);
  
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    console.log(`Making API request to: ${url.replace(apiKey, "API_KEY_REDACTED")}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`);
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }
    
    const channelStats = data.items[0].statistics;
    console.log("Stats received:", channelStats);
    
    return {
      subscriberCount: parseInt(channelStats.subscriberCount || '0'),
      viewCount: parseInt(channelStats.viewCount || '0'),
      videoCount: parseInt(channelStats.videoCount || '0')
    };
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    throw error;
  }
}

// For handling channel URLs that aren't direct IDs
async function resolveChannelId(url: string, apiKey: string) {
  console.log(`Attempting to resolve channel ID from URL: ${url}`);
  
  // Check if the input is already a channel ID (UC...)
  if (/^UC[\w-]{21,24}$/.test(url)) {
    console.log(`Input is already a channel ID: ${url}`);
    return url;
  }
  
  // Extract channel ID from URL if possible
  let match;
  
  // Handle /channel/ format
  match = url.match(/youtube\.com\/channel\/(UC[\w-]{21,24})/i);
  if (match && match[1]) {
    console.log(`Extracted channel ID from URL: ${match[1]}`);
    return match[1];
  }
  
  // Handle other formats by searching
  try {
    const searchTerm = url.includes('@') 
      ? url.match(/@([^\/\?]+)/)?.[1] || url 
      : url;
    
    console.log(`Searching for channel using term: ${searchTerm}`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("No channels found for the given URL");
    }
    
    const channelId = data.items[0].id.channelId;
    console.log(`Resolved channel ID via search: ${channelId}`);
    return channelId;
  } catch (error) {
    console.error("Error resolving channel ID:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      console.error("YouTube API key not configured");
      return createResponse({ error: "YouTube API key not configured" }, 500);
    }
    
    const requestData = await req.json();
    console.log("Request data:", requestData);
    
    const { channelId, url } = requestData;
    
    if (!channelId && !url) {
      return createResponse({ error: "Either channelId or url is required" }, 400);
    }
    
    // Resolve channel ID if a URL was provided
    let resolvedChannelId;
    try {
      resolvedChannelId = channelId || await resolveChannelId(url, YOUTUBE_API_KEY);
    } catch (error) {
      console.error("Error resolving channel ID:", error);
      return createResponse({ error: `Failed to resolve channel ID: ${error.message}` }, 200);
    }
    
    // Fetch statistics using the resolved channel ID
    try {
      const stats = await fetchChannelStats(resolvedChannelId, YOUTUBE_API_KEY);
      return createResponse(stats);
    } catch (error) {
      console.error("Error fetching channel stats:", error);
      return createResponse({ error: `Failed to fetch channel stats: ${error.message}` }, 200);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return createResponse({ error: `Unexpected error: ${error.message || "Unknown error"}` }, 500);
  }
})
