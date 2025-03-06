
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

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
    
    // Extract channel info from URL
    let channelData = null;
    let extractionMethod = "";
    
    // Try all methods in sequence until we get data
    const methods = [
      { name: "Direct Channel Method", fn: fetchChannelDirectly },
      { name: "Video Method", fn: fetchChannelViaVideo },
      { name: "Search Method", fn: fetchChannelViaSearch }
    ];
    
    // Try each method until one succeeds
    for (const method of methods) {
      try {
        console.log(`🔄 Trying ${method.name} for URL: ${url}`);
        channelData = await method.fn(url);
        if (channelData) {
          extractionMethod = method.name;
          console.log(`✅ Successfully extracted data using ${method.name}`);
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

// Fetch channel directly from ID or handle
async function fetchChannelDirectly(url) {
  console.log(`🔍 Attempting direct channel fetch for: ${url}`);
  
  // Extract channel ID
  let channelId = null;
  
  // Method 1: Try /channel/ID format
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[\w-]{21,24})/i);
  if (channelMatch && channelMatch[1]) {
    console.log(`🔹 Found channel ID in URL: ${channelMatch[1]}`);
    channelId = channelMatch[1];
  }
  
  // Method 2: Try custom URL format /c/customname
  if (!channelId && url.includes('/c/')) {
    const customUrlMatch = url.match(/youtube\.com\/c\/([^\/\?]+)/i);
    if (customUrlMatch && customUrlMatch[1]) {
      const customUrl = customUrlMatch[1];
      console.log(`🔹 Found custom URL: ${customUrl}, searching for channel ID`);
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(customUrl)}&type=channel&key=${YOUTUBE_API_KEY}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error('❌ YouTube API error for custom URL search:', errorData);
        throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
      }
      
      const searchData = await searchResponse.json();
      console.log(`🔍 Search results for custom URL:`, searchData);
      
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].id.channelId;
        console.log(`✅ Resolved custom URL to channel ID: ${channelId}`);
      }
    }
  }
  
  // Method 3: Try @handle format
  if (!channelId && (url.includes('@') || url.startsWith('@'))) {
    const handleMatch = url.includes('/@') 
      ? url.match(/\/@([^\/\?]+)/i) 
      : url.match(/\@([^\/\?\s]+)/i);
      
    if (handleMatch && handleMatch[1]) {
      const handle = handleMatch[1];
      console.log(`🔹 Found handle: @${handle}, searching for channel ID`);
      
      // First try direct search with @ prefix
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handle)}&type=channel&key=${YOUTUBE_API_KEY}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error('❌ YouTube API error for handle search:', errorData);
        throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
      }
      
      const searchData = await searchResponse.json();
      console.log(`🔍 Search results for handle:`, searchData);
      
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].id.channelId;
        console.log(`✅ Resolved handle to channel ID: ${channelId}`);
      }
    }
  }
  
  if (!channelId) {
    console.error('❌ Could not extract channel ID from URL using the direct method');
    throw new Error('Could not extract channel ID from URL');
  }
  
  // Fetch channel data
  console.log(`🔍 Fetching channel data for ID: ${channelId}`);
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!channelResponse.ok) {
    const errorData = await channelResponse.json();
    console.error('❌ YouTube API error for channel data:', errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const channelData = await channelResponse.json();
  console.log(`📊 Raw channel data:`, channelData);
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error('❌ Channel not found or invalid channel ID');
    throw new Error('Channel not found or invalid channel ID');
  }
  
  const channel = channelData.items[0];
  
  return formatChannelData(channel, channelId);
}

// Fetch channel via video
async function fetchChannelViaVideo(url) {
  console.log(`🔍 Attempting to fetch channel via video URL: ${url}`);
  
  // Extract video ID
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?\/#]+)/i);
  if (!videoMatch || !videoMatch[1]) {
    console.error('❌ Could not extract video ID');
    throw new Error('Could not extract video ID');
  }
  
  const videoId = videoMatch[1];
  console.log(`🔹 Extracted video ID: ${videoId}`);
  
  // Get channel ID from video
  const videoResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!videoResponse.ok) {
    const errorData = await videoResponse.json();
    console.error('❌ YouTube API error for video data:', errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const videoData = await videoResponse.json();
  console.log(`📊 Video data:`, videoData);
  
  if (!videoData.items || videoData.items.length === 0) {
    console.error('❌ Video not found or invalid video ID');
    throw new Error('Video not found or invalid video ID');
  }
  
  const channelId = videoData.items[0].snippet.channelId;
  console.log(`🔹 Found channel ID from video: ${channelId}`);
  
  // Get channel details
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!channelResponse.ok) {
    const errorData = await channelResponse.json();
    console.error('❌ YouTube API error for channel data via video:', errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const channelData = await channelResponse.json();
  console.log(`📊 Channel data via video:`, channelData);
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error('❌ Channel not found using video method');
    throw new Error('Channel not found using video method');
  }
  
  const channel = channelData.items[0];
  
  return formatChannelData(channel, channelId);
}

// Search for channel as last resort
async function fetchChannelViaSearch(url) {
  console.log(`🔍 Attempting to find channel via search: ${url}`);
  
  // Clean the URL for search
  let searchTerm = url;
  
  // Extract potential channel name from URL
  if (url.includes('youtube.com')) {
    const parts = url.replace(/https?:\/\/(www\.)?youtube\.com\/?/, '').split('/');
    searchTerm = parts[parts.length - 1].replace(/[@\/\?&=]/g, '');
  } else if (url.startsWith('@')) {
    // Handle the case where the URL is just a handle
    searchTerm = url.substring(1); // Remove the @ symbol
  }
  
  console.log(`🔍 Searching for channel with term: "${searchTerm}"`);
  
  // Search YouTube API
  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!searchResponse.ok) {
    const errorData = await searchResponse.json();
    console.error('❌ YouTube API error for search:', errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const searchData = await searchResponse.json();
  console.log(`📊 Search results:`, searchData);
  
  if (!searchData.items || searchData.items.length === 0) {
    console.error('❌ No channels found matching the search term');
    throw new Error('No channels found matching the search term');
  }
  
  // Take the first result (most relevant)
  const channelId = searchData.items[0].id.channelId;
  console.log(`🔹 Found channel ID via search: ${channelId}`);
  
  // Get full channel details
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!channelResponse.ok) {
    const errorData = await channelResponse.json();
    console.error('❌ YouTube API error for channel data from search:', errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const channelData = await channelResponse.json();
  console.log(`📊 Channel data from search:`, channelData);
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error('❌ Could not fetch channel details after finding via search');
    throw new Error('Could not fetch channel details after finding via search');
  }
  
  const channel = channelData.items[0];
  
  return formatChannelData(channel, channelId);
}

// Format channel data consistently
function formatChannelData(channel, channelId) {
  console.log(`📋 Formatting channel data for: ${channel.snippet.title}`);
  
  // Build a structured object with channel data
  const formattedData = {
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
    viewCount: parseInt(channel.statistics.viewCount || '0', 10),
    videoCount: parseInt(channel.statistics.videoCount || '0', 10),
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country || null,
    channelId: channelId,
    url: `https://www.youtube.com/channel/${channelId}`,
    channelType: guessChannelType(channel.snippet.title, channel.snippet.description),
    keywords: extractKeywords(channel.snippet.description || '')
  };
  
  console.log(`✅ Formatted channel data:`, formattedData);
  return formattedData;
}

// Guess channel type based on content
function guessChannelType(title, description) {
  const combined = (title + ' ' + description).toLowerCase();
  
  if (combined.includes('brand') || combined.includes('company') || combined.includes('business') || combined.includes('official')) {
    return 'brand';
  } else if (combined.includes('news') || combined.includes('report') || combined.includes('media')) {
    return 'media';
  } else {
    return 'creator'; // Default to creator
  }
}

// Extract potential keywords from description
function extractKeywords(description) {
  if (!description) return [];
  
  // Look for hashtags
  const hashtags = description.match(/#[\w\u00C0-\u017F]+/g) || [];
  const cleanHashtags = hashtags.map(tag => tag.substring(1));
  
  // Extract other potential keywords (words that repeat or are capitalized)
  const words = description
    .replace(/[^\w\s\u00C0-\u017F]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.trim());
  
  const wordCount = {};
  words.forEach(word => {
    wordCount[word.toLowerCase()] = (wordCount[word.toLowerCase()] || 0) + 1;
  });
  
  const frequentWords = Object.keys(wordCount)
    .filter(word => wordCount[word] > 1 || (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 4))
    .slice(0, 10);
  
  // Combine hashtags and frequent words, remove duplicates
  const allKeywords = [...new Set([...cleanHashtags, ...frequentWords])];
  
  return allKeywords.slice(0, 15); // Limit to 15 keywords
}
