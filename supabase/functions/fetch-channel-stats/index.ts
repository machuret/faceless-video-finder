
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
    
    // Check if the URL contains a channel name without @ (like "One Percent Better")
    const channelName = url.includes('youtube.com') 
      ? url.split('/').filter(Boolean).pop() 
      : url;
    
    const finalSearchTerm = searchTerm !== url ? searchTerm : channelName;
    
    console.log(`Searching for channel using term: ${finalSearchTerm}`);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(finalSearchTerm)}&type=channel&key=${apiKey}`;
    
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

// Check if channel exists via search API
async function checkChannelExists(channelName: string, apiKey: string) {
  console.log(`Checking if channel exists: ${channelName}`);
  
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelName)}&type=channel&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log(`No channel found with name: ${channelName}`);
      return null;
    }
    
    // Find the most relevant channel by matching name
    const relevantChannel = data.items.find((item: any) => {
      const title = item.snippet.title.toLowerCase();
      const searchTermLower = channelName.toLowerCase();
      return title === searchTermLower || title.includes(searchTermLower);
    }) || data.items[0]; // Fall back to first result if no direct match
    
    console.log(`Found channel: ${relevantChannel.snippet.title} (${relevantChannel.id.channelId})`);
    return {
      id: relevantChannel.id.channelId,
      title: relevantChannel.snippet.title,
      thumbnail: relevantChannel.snippet.thumbnails?.default?.url || null
    };
  } catch (error) {
    console.error(`Error checking if channel exists: ${error}`);
    return null;
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
    
    // For plain text channel names (like "One Percent Better"), try to find the channel first
    if (!channelId && !url.includes('youtube.com') && !url.includes('@') && !url.startsWith('UC')) {
      const channelInfo = await checkChannelExists(url, YOUTUBE_API_KEY);
      
      if (channelInfo) {
        try {
          const stats = await fetchChannelStats(channelInfo.id, YOUTUBE_API_KEY);
          return createResponse({
            ...stats,
            channelInfo: {
              title: channelInfo.title,
              id: channelInfo.id,
              thumbnailUrl: channelInfo.thumbnail
            }
          });
        } catch (error) {
          console.error("Error fetching channel stats:", error);
          return createResponse({ 
            error: `Found channel "${channelInfo.title}" but failed to fetch stats: ${error.message}`,
            channelInfo
          }, 200);
        }
      } else {
        return createResponse({ error: `Could not find channel with name: ${url}` }, 200);
      }
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
