
// Define corsHeaders to be used in HTTP requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Extracts channel data directly from a channel ID, custom URL, or handle
 */
export async function fetchChannelDirectly(url: string, YOUTUBE_API_KEY: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Attempting direct channel fetch for: ${url}`);
  
  // Extract channel ID
  let channelId = null;
  
  // Method 1: Try /channel/ID format
  const channelMatch = url.match(/youtube\.com\/channel\/(UC[\w-]{21,24})/i);
  if (channelMatch && channelMatch[1]) {
    console.log(`🔹 [${timestamp}] Found channel ID in URL: ${channelMatch[1]}`);
    channelId = channelMatch[1];
  }
  
  // Method 2: Try custom URL format /c/customname
  if (!channelId && url.includes('/c/')) {
    const customUrlMatch = url.match(/youtube\.com\/c\/([^\/\?]+)/i);
    if (customUrlMatch && customUrlMatch[1]) {
      const customUrl = customUrlMatch[1];
      console.log(`🔹 [${timestamp}] Found custom URL: ${customUrl}, searching for channel ID`);
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(customUrl)}&type=channel&key=${YOUTUBE_API_KEY}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error(`❌ [${timestamp}] YouTube API error for custom URL search:`, errorData);
        throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
      }
      
      const searchData = await searchResponse.json();
      console.log(`🔍 [${timestamp}] Search results for custom URL:`, searchData);
      
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].id.channelId;
        console.log(`✅ [${timestamp}] Resolved custom URL to channel ID: ${channelId}`);
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
      console.log(`🔹 [${timestamp}] Found handle: @${handle}, searching for channel ID`);
      
      // First try direct search with @ prefix
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handle)}&type=channel&key=${YOUTUBE_API_KEY}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error(`❌ [${timestamp}] YouTube API error for handle search:`, errorData);
        throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
      }
      
      const searchData = await searchResponse.json();
      console.log(`🔍 [${timestamp}] Search results for handle:`, searchData);
      
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].id.channelId;
        console.log(`✅ [${timestamp}] Resolved handle to channel ID: ${channelId}`);
      }
    }
  }
  
  if (!channelId) {
    console.error(`❌ [${timestamp}] Could not extract channel ID from URL using the direct method`);
    throw new Error('Could not extract channel ID from URL');
  }
  
  // Fetch channel data
  console.log(`🔍 [${timestamp}] Fetching channel data for ID: ${channelId}`);
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!channelResponse.ok) {
    const errorData = await channelResponse.json();
    console.error(`❌ [${timestamp}] YouTube API error for channel data:`, errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const channelData = await channelResponse.json();
  console.log(`📊 [${timestamp}] Raw channel data:`, channelData);
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error(`❌ [${timestamp}] Channel not found or invalid channel ID`);
    throw new Error('Channel not found or invalid channel ID');
  }
  
  const channel = channelData.items[0];
  
  return { channel, channelId };
}

/**
 * Extract channel data via a video URL
 */
export async function fetchChannelViaVideo(url: string, YOUTUBE_API_KEY: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Attempting to fetch channel via video URL: ${url}`);
  
  // Extract video ID
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?\/#]+)/i);
  if (!videoMatch || !videoMatch[1]) {
    console.error(`❌ [${timestamp}] Could not extract video ID`);
    throw new Error('Could not extract video ID');
  }
  
  const videoId = videoMatch[1];
  console.log(`🔹 [${timestamp}] Extracted video ID: ${videoId}`);
  
  // Get channel ID from video
  const videoResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!videoResponse.ok) {
    const errorData = await videoResponse.json();
    console.error(`❌ [${timestamp}] YouTube API error for video data:`, errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const videoData = await videoResponse.json();
  console.log(`📊 [${timestamp}] Video data:`, videoData);
  
  if (!videoData.items || videoData.items.length === 0) {
    console.error(`❌ [${timestamp}] Video not found or invalid video ID`);
    throw new Error('Video not found or invalid video ID');
  }
  
  const channelId = videoData.items[0].snippet.channelId;
  console.log(`🔹 [${timestamp}] Found channel ID from video: ${channelId}`);
  
  // Get channel details
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!channelResponse.ok) {
    const errorData = await channelResponse.json();
    console.error(`❌ [${timestamp}] YouTube API error for channel data via video:`, errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const channelData = await channelResponse.json();
  console.log(`📊 [${timestamp}] Channel data via video:`, channelData);
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error(`❌ [${timestamp}] Channel not found using video method`);
    throw new Error('Channel not found using video method');
  }
  
  const channel = channelData.items[0];
  
  return { channel, channelId };
}

/**
 * Search for channel as last resort
 */
export async function fetchChannelViaSearch(url: string, YOUTUBE_API_KEY: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Attempting to find channel via search: ${url}`);
  
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
  
  console.log(`🔍 [${timestamp}] Searching for channel with term: "${searchTerm}"`);
  
  // Search YouTube API
  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!searchResponse.ok) {
    const errorData = await searchResponse.json();
    console.error(`❌ [${timestamp}] YouTube API error for search:`, errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const searchData = await searchResponse.json();
  console.log(`📊 [${timestamp}] Search results:`, searchData);
  
  if (!searchData.items || searchData.items.length === 0) {
    console.error(`❌ [${timestamp}] No channels found matching the search term`);
    throw new Error('No channels found matching the search term');
  }
  
  // Take the first result (most relevant)
  const channelId = searchData.items[0].id.channelId;
  console.log(`🔹 [${timestamp}] Found channel ID via search: ${channelId}`);
  
  // Get full channel details
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (!channelResponse.ok) {
    const errorData = await channelResponse.json();
    console.error(`❌ [${timestamp}] YouTube API error for channel data from search:`, errorData);
    throw new Error(`YouTube API error: ${errorData?.error?.message || 'Unknown API error'}`);
  }
  
  const channelData = await channelResponse.json();
  console.log(`📊 [${timestamp}] Channel data from search:`, channelData);
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error(`❌ [${timestamp}] Could not fetch channel details after finding via search`);
    throw new Error('Could not fetch channel details after finding via search');
  }
  
  const channel = channelData.items[0];
  
  return { channel, channelId };
}
