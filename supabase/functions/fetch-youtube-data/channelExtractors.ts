
// Define corsHeaders to be used in HTTP requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Helper function to make YouTube API requests with consistent error handling
 */
async function fetchFromYouTubeAPI(url: string, timestamp: string) {
  console.log(`🔍 [${timestamp}] Fetching from YouTube API:`, url);
  
  try {
    // Set a specific timeout for each API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced from 8s to 5s
    
    try {
      const response = await fetch(url, { 
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      // Clear timeout as soon as response is received
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { status: response.status, statusText: response.statusText };
        }
        
        console.error(`❌ [${timestamp}] YouTube API error (${response.status}):`, errorData);
        
        // Format error message based on YouTube API error format
        const apiErrorMessage = errorData?.error?.message || 
                               errorData?.error?.errors?.[0]?.message ||
                               `API request failed with status ${response.status}`;
        
        throw new Error(`YouTube API error: ${apiErrorMessage}`);
      }
      
      const data = await response.json();
      console.log(`✅ [${timestamp}] YouTube API response successful`);
      return data;
    } catch (error) {
      // Always clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Re-throw the error to be handled by the caller
      if (error.name === 'AbortError') {
        console.error(`❌ [${timestamp}] YouTube API request timed out`);
        throw new Error('YouTube API request timed out. Please try again.');
      }
      
      throw error;
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] Error fetching from YouTube API:`, error.message);
    throw error;
  }
}

/**
 * Extracts channel data directly from a channel ID, custom URL, or handle
 */
export async function fetchChannelDirectly(url: string, YOUTUBE_API_KEY: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Attempting direct channel fetch for: ${url}`);
  
  // Extract channel ID
  let channelId = null;
  
  try {
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
        
        try {
          const searchData = await fetchFromYouTubeAPI(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(customUrl)}&type=channel&key=${YOUTUBE_API_KEY}`,
            timestamp
          );
          
          console.log(`🔍 [${timestamp}] Search results for custom URL:`, searchData);
          
          if (searchData.items && searchData.items.length > 0) {
            channelId = searchData.items[0].id.channelId;
            console.log(`✅ [${timestamp}] Resolved custom URL to channel ID: ${channelId}`);
          }
        } catch (error) {
          console.error(`❌ [${timestamp}] Error resolving custom URL:`, error.message);
          throw new Error(`Failed to resolve custom URL: ${error.message}`);
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
        
        try {
          // First try direct search with @ prefix
          const searchData = await fetchFromYouTubeAPI(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handle)}&type=channel&key=${YOUTUBE_API_KEY}`,
            timestamp
          );
          
          console.log(`🔍 [${timestamp}] Search results for handle:`, searchData);
          
          if (searchData.items && searchData.items.length > 0) {
            channelId = searchData.items[0].id.channelId;
            console.log(`✅ [${timestamp}] Resolved handle to channel ID: ${channelId}`);
          }
        } catch (error) {
          console.error(`❌ [${timestamp}] Error resolving handle:`, error.message);
          throw new Error(`Failed to resolve handle: ${error.message}`);
        }
      }
    }
    
    if (!channelId) {
      console.error(`❌ [${timestamp}] Could not extract channel ID from URL using the direct method`);
      throw new Error('Could not extract channel ID from URL');
    }
    
    // Fetch channel data
    console.log(`🔍 [${timestamp}] Fetching channel data for ID: ${channelId}`);
    try {
      const channelData = await fetchFromYouTubeAPI(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
        timestamp
      );
      
      console.log(`📊 [${timestamp}] Raw channel data:`, channelData);
      
      if (!channelData.items || channelData.items.length === 0) {
        console.error(`❌ [${timestamp}] Channel not found or invalid channel ID`);
        throw new Error('Channel not found or invalid channel ID');
      }
      
      const channel = channelData.items[0];
      return { channel, channelId };
    } catch (error) {
      console.error(`❌ [${timestamp}] Error fetching channel data:`, error.message);
      throw new Error(`Error fetching channel data: ${error.message}`);
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] Error in fetchChannelDirectly:`, error.message);
    throw error;
  }
}

/**
 * Extract channel data via a video URL
 */
export async function fetchChannelViaVideo(url: string, YOUTUBE_API_KEY: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Attempting to fetch channel via video URL: ${url}`);
  
  try {
    // Extract video ID
    const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?\/#]+)/i);
    if (!videoMatch || !videoMatch[1]) {
      console.error(`❌ [${timestamp}] Could not extract video ID`);
      throw new Error('Could not extract video ID');
    }
    
    const videoId = videoMatch[1];
    console.log(`🔹 [${timestamp}] Extracted video ID: ${videoId}`);
    
    // Get channel ID from video
    try {
      const videoData = await fetchFromYouTubeAPI(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`,
        timestamp
      );
      
      console.log(`📊 [${timestamp}] Video data:`, videoData);
      
      if (!videoData.items || videoData.items.length === 0) {
        console.error(`❌ [${timestamp}] Video not found or invalid video ID`);
        throw new Error('Video not found or invalid video ID');
      }
      
      const channelId = videoData.items[0].snippet.channelId;
      console.log(`🔹 [${timestamp}] Found channel ID from video: ${channelId}`);
      
      // Get channel details
      const channelData = await fetchFromYouTubeAPI(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
        timestamp
      );
      
      console.log(`📊 [${timestamp}] Channel data via video:`, channelData);
      
      if (!channelData.items || channelData.items.length === 0) {
        console.error(`❌ [${timestamp}] Channel not found using video method`);
        throw new Error('Channel not found using video method');
      }
      
      const channel = channelData.items[0];
      return { channel, channelId };
    } catch (error) {
      console.error(`❌ [${timestamp}] Error fetching channel via video:`, error.message);
      throw new Error(`Error fetching channel via video: ${error.message}`);
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] Error in fetchChannelViaVideo:`, error.message);
    throw error;
  }
}

/**
 * Search for channel as last resort
 */
export async function fetchChannelViaSearch(url: string, YOUTUBE_API_KEY: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Attempting to find channel via search: ${url}`);
  
  try {
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
    const searchData = await fetchFromYouTubeAPI(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`,
      timestamp
    );
    
    console.log(`📊 [${timestamp}] Search results:`, searchData);
    
    if (!searchData.items || searchData.items.length === 0) {
      console.error(`❌ [${timestamp}] No channels found matching the search term`);
      throw new Error('No channels found matching the search term');
    }
    
    // Take the first result (most relevant)
    const channelId = searchData.items[0].id.channelId;
    console.log(`🔹 [${timestamp}] Found channel ID via search: ${channelId}`);
    
    // Get full channel details
    const channelData = await fetchFromYouTubeAPI(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
      timestamp
    );
    
    console.log(`📊 [${timestamp}] Channel data from search:`, channelData);
    
    if (!channelData.items || channelData.items.length === 0) {
      console.error(`❌ [${timestamp}] Could not fetch channel details after finding via search`);
      throw new Error('Could not fetch channel details after finding via search');
    }
    
    const channel = channelData.items[0];
    return { channel, channelId };
  } catch (error) {
    console.error(`❌ [${timestamp}] Error in fetchChannelViaSearch:`, error.message);
    throw new Error(`Error fetching channel via search: ${error.message}`);
  }
}
