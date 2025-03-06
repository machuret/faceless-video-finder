
// Simple edge function to fetch YouTube channel data
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Logging with timestamps for better tracking
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 fetch-youtube-data function invoked`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] ✅ Handling CORS preflight`);
    return new Response(null, { headers: corsHeaders });
  }
  
  // Verify YouTube API key is present
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  if (!YOUTUBE_API_KEY) {
    console.error(`[${timestamp}] ❌ YouTube API key not configured`);
    return new Response(
      JSON.stringify({ error: 'YouTube API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log(`[${timestamp}] 📥 Request method: ${req.method}`);

    // Parse request body 
    const bodyText = await req.text();
    console.log(`[${timestamp}] 📄 Raw request body: ${bodyText}`);
    
    if (!bodyText) {
      console.error(`[${timestamp}] ❌ Empty request body`);
      throw new Error('Empty request body');
    }
    
    const { url } = JSON.parse(bodyText);
    console.log(`[${timestamp}] 🔗 Processing URL: ${url}`);
    
    if (!url) {
      console.error(`[${timestamp}] ❌ URL is missing from request`);
      throw new Error('URL is required');
    }

    // Identify URL type and extract appropriate IDs
    let channelId = null;
    let videoId = null;
    let searchQuery = null;

    // 1. Try direct channel ID
    if (url.includes('/channel/')) {
      const match = url.match(/\/channel\/(UC[\w-]{21,24})/);
      if (match && match[1]) {
        channelId = match[1];
        console.log(`[${timestamp}] 📺 Direct channel ID found: ${channelId}`);
      }
    }
    
    // 2. Try handle (@username) format
    else if (url.includes('@')) {
      searchQuery = url.includes('/@') 
        ? url.match(/\/@([^\/\?]+)/)?.[1] 
        : url.match(/@([^\/\?\s]+)/)?.[1];
      
      if (searchQuery) {
        console.log(`[${timestamp}] 🔍 Handle found: @${searchQuery}`);
      }
    }
    
    // 3. Try custom URL format
    else if (url.includes('/c/')) {
      searchQuery = url.match(/\/c\/([^\/\?]+)/)?.[1];
      if (searchQuery) {
        console.log(`[${timestamp}] 🔍 Custom URL found: ${searchQuery}`);
      }
    }
    
    // 4. Try video URL format and get channel from video
    else if (url.includes('watch?v=') || url.includes('youtu.be/')) {
      videoId = url.includes('watch?v=') 
        ? url.match(/watch\?v=([^&]+)/)?.[1] 
        : url.match(/youtu\.be\/([^\/\?]+)/)?.[1];
      
      if (videoId) {
        console.log(`[${timestamp}] 🎬 Video ID found: ${videoId}`);
      }
    }
    
    // 5. If nothing else matches, use as direct search term
    else {
      searchQuery = url.trim();
      console.log(`[${timestamp}] 🔍 Using URL as search term: ${searchQuery}`);
    }

    // Execute appropriate API call based on what we found
    let channelData = null;

    // 1. If we have a channel ID, fetch it directly
    if (channelId) {
      console.log(`[${timestamp}] 📊 Fetching channel data by ID: ${channelId}`);
      channelData = await fetchChannelById(channelId, YOUTUBE_API_KEY, timestamp);
    }
    
    // 2. If we have a video ID, get channel from video
    else if (videoId) {
      console.log(`[${timestamp}] 🎬 Fetching channel data via video: ${videoId}`);
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!videoResponse.ok) {
        throw new Error(`YouTube API error: ${videoResponse.status} ${videoResponse.statusText}`);
      }
      
      const videoData = await videoResponse.json();
      console.log(`[${timestamp}] 📊 Video data:`, JSON.stringify(videoData, null, 2));
      
      if (videoData.items && videoData.items.length > 0) {
        const videoChannelId = videoData.items[0].snippet.channelId;
        console.log(`[${timestamp}] 📺 Got channel ID from video: ${videoChannelId}`);
        channelData = await fetchChannelById(videoChannelId, YOUTUBE_API_KEY, timestamp);
      } else {
        throw new Error('Video not found or has no channel data');
      }
    }
    
    // 3. If we have a search query, search for the channel
    else if (searchQuery) {
      console.log(`[${timestamp}] 🔍 Searching for channel: ${searchQuery}`);
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      
      if (!searchResponse.ok) {
        throw new Error(`YouTube API search error: ${searchResponse.status} ${searchResponse.statusText}`);
      }
      
      const searchData = await searchResponse.json();
      console.log(`[${timestamp}] 🔍 Search results:`, JSON.stringify(searchData, null, 2));
      
      if (searchData.items && searchData.items.length > 0) {
        const searchChannelId = searchData.items[0].id.channelId;
        console.log(`[${timestamp}] 📺 Got channel ID from search: ${searchChannelId}`);
        channelData = await fetchChannelById(searchChannelId, YOUTUBE_API_KEY, timestamp);
      } else {
        throw new Error('No channels found matching the search term');
      }
    } else {
      throw new Error('Could not determine how to process the URL');
    }

    console.log(`[${timestamp}] ✅ Successfully processed channel data`);
    return new Response(
      JSON.stringify({ channelData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${timestamp}] ❌ Error:`, error.message);
    console.error(`[${timestamp}] ❌ Stack:`, error.stack);
    
    // Return mock data for testing
    const mockData = {
      title: "Mock YouTube Channel",
      description: "This is mock data for testing because an error occurred.",
      thumbnailUrl: "https://via.placeholder.com/120x120",
      subscriberCount: 1000,
      viewCount: 50000,
      videoCount: 100,
      publishedAt: "2020-01-01T00:00:00Z",
      country: "US",
      channelId: "UC000000000000000000000000",
      url: "https://www.youtube.com/channel/UC000000000000000000000000",
      channelType: "creator",
      keywords: ["mock", "test", "youtube"]
    };
    
    return new Response(
      JSON.stringify({ 
        channelData: mockData,
        error: error.message,
        stack: error.stack
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to fetch channel data by ID
async function fetchChannelById(channelId, apiKey, timestamp) {
  console.log(`[${timestamp}] 📊 Fetching channel by ID: ${channelId}`);
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`[${timestamp}] 📊 Channel API response:`, JSON.stringify(data, null, 2));
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Channel not found or invalid channel ID');
  }
  
  const channel = data.items[0];
  
  // Format the channel data
  return {
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
    viewCount: parseInt(channel.statistics.viewCount || '0', 10),
    videoCount: parseInt(channel.statistics.videoCount || '0', 10),
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country || 'Unknown',
    channelId: channelId,
    url: `https://www.youtube.com/channel/${channelId}`,
    channelType: determineChannelType(channel.snippet.title, channel.snippet.description),
    keywords: extractKeywords(channel.snippet.description || '')
  };
}

// Helper function to determine channel type
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

// Helper function to extract keywords
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
