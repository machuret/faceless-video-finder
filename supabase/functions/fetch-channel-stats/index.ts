
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

// Improved function to fetch channel stats with better error handling
async function fetchChannelStats(channelId: string, apiKey: string, includeDescription = false) {
  console.log(`Fetching stats for channel ID: ${channelId}`);
  
  try {
    // When includeDescription is true, we want to get the channel's "about" information
    const parts = includeDescription ? 'statistics,snippet,brandingSettings' : 'statistics,snippet';
    const url = `https://www.googleapis.com/youtube/v3/channels?part=${parts}&id=${channelId}&key=${apiKey}`;
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
    
    const channel = data.items[0];
    const channelStats = channel.statistics;
    const channelInfo = channel.snippet;
    
    // Get the channel description from brandingSettings if available (more detailed than snippet)
    let description = channelInfo.description;
    if (includeDescription && channel.brandingSettings && channel.brandingSettings.channel) {
      description = channel.brandingSettings.channel.description || description;
    }
    
    console.log("Stats received:", channelStats);
    console.log("Channel info:", channelInfo.title);
    
    if (includeDescription) {
      console.log("Description length:", description ? description.length : 0);
    }
    
    return {
      subscriberCount: parseInt(channelStats.subscriberCount || '0'),
      viewCount: parseInt(channelStats.viewCount || '0'),
      videoCount: parseInt(channelStats.videoCount || '0'),
      channelInfo: {
        title: channelInfo.title,
        description: description,
        thumbnailUrl: channelInfo.thumbnails?.default?.url
      }
    };
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    throw error;
  }
}

// Enhanced function to resolve channel ID from different input formats
async function resolveChannelId(input: string, apiKey: string) {
  console.log(`Attempting to resolve channel ID from input: ${input}`);
  
  // Check if the input is already a channel ID (UC...)
  if (/^UC[\w-]{21,24}$/.test(input)) {
    console.log(`Input is already a channel ID: ${input}`);
    return input;
  }
  
  // Extract channel ID from URL if possible
  let match;
  
  // Handle /channel/ format
  match = input.match(/youtube\.com\/channel\/(UC[\w-]{21,24})/i);
  if (match && match[1]) {
    console.log(`Extracted channel ID from URL: ${match[1]}`);
    return match[1];
  }
  
  // Handle handle format (@username)
  if (input.includes('@')) {
    const handleMatch = input.match(/@([^\/\?]+)/);
    if (handleMatch && handleMatch[1]) {
      const handle = handleMatch[1];
      console.log(`Extracted handle: @${handle}, searching for channel ID`);
      
      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handle)}&type=channel&maxResults=1&key=${apiKey}`;
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const channelId = data.items[0].id.channelId;
          console.log(`Resolved handle to channel ID: ${channelId}`);
          return channelId;
        }
      } catch (error) {
        console.error(`Error resolving handle: ${error}`);
      }
    }
  }
  
  // For plain text channel names (like "One Percent Better")
  // Use search API to find the channel
  try {
    console.log(`Searching for channel with name: "${input}"`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&type=channel&maxResults=1&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error(`No channels found matching "${input}"`);
    }
    
    // Get the first result (most relevant)
    const channelId = data.items[0].id.channelId;
    const channelTitle = data.items[0].snippet.title;
    
    console.log(`Found channel via search: ${channelTitle} (${channelId})`);
    return channelId;
  } catch (error) {
    console.error(`Error resolving channel name: ${error}`);
    throw new Error(`Could not find channel with name: ${input}`);
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
    
    const { channelId, url, timestamp, includeDescription = false, fetchDescriptionOnly = false } = requestData;
    
    if (!channelId && !url) {
      return createResponse({ error: "Either channelId or url is required" }, 400);
    }
    
    // Log timestamp if provided
    if (timestamp) {
      console.log(`Request timestamp: ${timestamp}`);
    }
    
    // Resolve channel ID if a URL or name was provided
    let resolvedChannelId;
    try {
      resolvedChannelId = channelId || await resolveChannelId(url, YOUTUBE_API_KEY);
    } catch (error) {
      console.error("Error resolving channel ID:", error);
      return createResponse({ error: `Failed to resolve channel ID: ${error.message}` }, 200);
    }
    
    // Fetch statistics using the resolved channel ID
    try {
      // Always include description if fetchDescriptionOnly is true
      const includingDescription = includeDescription || fetchDescriptionOnly;
      const stats = await fetchChannelStats(resolvedChannelId, YOUTUBE_API_KEY, includingDescription);
      
      // If fetchDescriptionOnly is true, only return the description
      if (fetchDescriptionOnly) {
        console.log("Description-only mode, returning only channel info");
        return createResponse({
          channelInfo: stats.channelInfo
        });
      }
      
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
