
import { fetchFromYouTubeAPI } from './apiUtils.ts';

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
      
      try {
        const searchData = await fetchFromYouTubeAPI(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(customUrl)}&type=channel&key=${YOUTUBE_API_KEY}`,
          timestamp
        );
        
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
        // Direct search with @ prefix
        const searchData = await fetchFromYouTubeAPI(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handle)}&type=channel&key=${YOUTUBE_API_KEY}`,
          timestamp
        );
        
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
  
  return await fetchChannelData(channelId, YOUTUBE_API_KEY, timestamp);
}

/**
 * Fetches channel data once we have a channel ID
 */
export async function fetchChannelData(channelId: string, YOUTUBE_API_KEY: string, timestamp: string) {
  console.log(`🔍 [${timestamp}] Fetching channel data for ID: ${channelId}`);
  
  const channelData = await fetchFromYouTubeAPI(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    timestamp
  );
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error(`❌ [${timestamp}] Channel not found or invalid channel ID`);
    throw new Error('Channel not found or invalid channel ID');
  }
  
  const channel = channelData.items[0];
  return { channel, channelId };
}
