
// Simple edge function to fetch YouTube channel data
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔄 fetch-youtube-data function invoked`);
  
  try {
    // Get the API key from environment
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    console.log(`[${timestamp}] 🔑 YouTube API key exists: ${Boolean(YOUTUBE_API_KEY)}`);
    
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured');
    }

    // Parse request body
    let body;
    try {
      const bodyText = await req.text();
      console.log(`[${timestamp}] 📝 Raw request body: ${bodyText}`);
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error(`[${timestamp}] ❌ Error parsing request body:`, e);
      throw new Error(`Invalid request body: ${e.message}`);
    }

    const url = body?.url;
    console.log(`[${timestamp}] 🔗 URL from request: ${url}`);
    
    if (!url) {
      throw new Error('URL is required in the request body');
    }

    // Extract channel information from the URL
    let channelId = null;
    let channelUsername = null;
    let videoId = null;
    
    // Try to extract channel ID, username or video ID from URL
    if (url.includes('/channel/')) {
      const match = url.match(/\/channel\/(UC[\w-]{21,24})/);
      if (match && match[1]) {
        channelId = match[1];
        console.log(`[${timestamp}] 📺 Found channel ID: ${channelId}`);
      }
    } else if (url.includes('@')) {
      channelUsername = url.includes('/@') 
        ? url.match(/\/@([^\/\?]+)/)?.[1] 
        : url.match(/@([^\/\?\s]+)/)?.[1];
      console.log(`[${timestamp}] 👤 Found channel username: ${channelUsername}`);
    } else if (url.includes('watch?v=') || url.includes('youtu.be/')) {
      videoId = url.includes('watch?v=') 
        ? url.match(/watch\?v=([^&]+)/)?.[1] 
        : url.match(/youtu\.be\/([^\/\?]+)/)?.[1];
      console.log(`[${timestamp}] 🎬 Found video ID: ${videoId}`);
    } else if (url.includes('/c/')) {
      const customUrlMatch = url.match(/\/c\/([^\/\?]+)/);
      if (customUrlMatch && customUrlMatch[1]) {
        channelUsername = customUrlMatch[1];
        console.log(`[${timestamp}] 📝 Found custom URL: ${channelUsername}`);
      }
    }

    let channelData = null;
    
    // 1. If we have a channel ID, get data directly
    if (channelId) {
      console.log(`[${timestamp}] 🔍 Fetching channel by ID: ${channelId}`);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[${timestamp}] ❌ YouTube API error (channel ID): ${response.status}`, errorBody);
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[${timestamp}] ✅ Channel data by ID received`);
      
      if (data.items && data.items.length > 0) {
        channelData = formatChannelData(data.items[0], channelId);
      } else {
        throw new Error('Channel not found');
      }
    }
    
    // 2. If we have a video ID, get channel from video
    else if (videoId) {
      console.log(`[${timestamp}] 🔍 Fetching channel via video ID: ${videoId}`);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[${timestamp}] ❌ YouTube API error (video): ${response.status}`, errorBody);
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[${timestamp}] ✅ Video data received`);
      
      if (data.items && data.items.length > 0) {
        const videoChannelId = data.items[0].snippet.channelId;
        console.log(`[${timestamp}] 🔍 Fetching channel from video: ${videoChannelId}`);
        
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${videoChannelId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!channelResponse.ok) {
          const errorBody = await channelResponse.text();
          console.error(`[${timestamp}] ❌ YouTube API error (channel from video): ${channelResponse.status}`, errorBody);
          throw new Error(`YouTube API error: ${channelResponse.status} ${channelResponse.statusText}`);
        }
        
        const channelData = await channelResponse.json();
        console.log(`[${timestamp}] ✅ Channel data from video received`);
        
        if (channelData.items && channelData.items.length > 0) {
          channelData = formatChannelData(channelData.items[0], videoChannelId);
        } else {
          throw new Error('Channel not found from video');
        }
      } else {
        throw new Error('Video not found');
      }
    }
    
    // 3. If we have a username or custom URL, search for the channel
    else if (channelUsername) {
      console.log(`[${timestamp}] 🔍 Searching for channel by username: ${channelUsername}`);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelUsername)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[${timestamp}] ❌ YouTube API error (search): ${response.status}`, errorBody);
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[${timestamp}] ✅ Search results received`);
      
      if (data.items && data.items.length > 0) {
        const searchChannelId = data.items[0].id.channelId;
        console.log(`[${timestamp}] 🔍 Fetching channel from search: ${searchChannelId}`);
        
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${searchChannelId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!channelResponse.ok) {
          const errorBody = await channelResponse.text();
          console.error(`[${timestamp}] ❌ YouTube API error (channel from search): ${channelResponse.status}`, errorBody);
          throw new Error(`YouTube API error: ${channelResponse.status} ${channelResponse.statusText}`);
        }
        
        const channelResult = await channelResponse.json();
        console.log(`[${timestamp}] ✅ Channel data from search received`);
        
        if (channelResult.items && channelResult.items.length > 0) {
          channelData = formatChannelData(channelResult.items[0], searchChannelId);
        } else {
          throw new Error('Channel not found from search');
        }
      } else {
        throw new Error('No channels found matching the username');
      }
    } else {
      // 4. Last resort: Try direct search with the full URL
      console.log(`[${timestamp}] 🔍 Trying direct search with URL: ${url}`);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(url)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[${timestamp}] ❌ YouTube API error (fallback search): ${response.status}`, errorBody);
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`[${timestamp}] ✅ Fallback search results received`);
      
      if (data.items && data.items.length > 0) {
        const searchChannelId = data.items[0].id.channelId;
        console.log(`[${timestamp}] 🔍 Fetching channel from fallback search: ${searchChannelId}`);
        
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${searchChannelId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!channelResponse.ok) {
          const errorBody = await channelResponse.text();
          console.error(`[${timestamp}] ❌ YouTube API error (channel from fallback): ${channelResponse.status}`, errorBody);
          throw new Error(`YouTube API error: ${channelResponse.status} ${channelResponse.statusText}`);
        }
        
        const channelResult = await channelResponse.json();
        console.log(`[${timestamp}] ✅ Channel data from fallback search received`);
        
        if (channelResult.items && channelResult.items.length > 0) {
          channelData = formatChannelData(channelResult.items[0], searchChannelId);
        } else {
          throw new Error('Channel not found from fallback search');
        }
      } else {
        throw new Error('No channels found for this URL');
      }
    }

    // Return the channel data
    console.log(`[${timestamp}] ✅ Successfully processed channel data, returning response`);
    return new Response(
      JSON.stringify({ channelData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error in fetch-youtube-data:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function formatChannelData(channel, channelId) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📊 Formatting channel data for: ${channel.snippet.title}`);
  
  return {
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
    viewCount: parseInt(channel.statistics.viewCount || '0', 10),
    videoCount: parseInt(channel.statistics.videoCount || '0', 10),
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country || '',
    channelId: channelId,
    url: `https://www.youtube.com/channel/${channelId}`,
    channelType: determineChannelType(channel.snippet.title, channel.snippet.description),
    keywords: extractKeywords(channel.snippet.description || '')
  };
}

function determineChannelType(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('brand') || text.includes('company') || text.includes('official')) {
    return 'brand';
  } else if (text.includes('news') || text.includes('media')) {
    return 'media';
  } else {
    return 'creator';
  }
}

function extractKeywords(description) {
  if (!description) return [];
  
  // Extract hashtags
  const hashtags = description.match(/#[\w\u00C0-\u017F]+/g) || [];
  const cleanHashtags = hashtags.map(tag => tag.substring(1));
  
  // Get frequently used words
  const words = description
    .replace(/[^\w\s\u00C0-\u017F]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount = {};
  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    wordCount[lowerWord] = (wordCount[lowerWord] || 0) + 1;
  });
  
  const significantWords = Object.keys(wordCount)
    .filter(word => wordCount[word] > 1)
    .slice(0, 5);
  
  // Combine hashtags and significant words, remove duplicates
  return [...new Set([...cleanHashtags, ...significantWords])].slice(0, 10);
}
