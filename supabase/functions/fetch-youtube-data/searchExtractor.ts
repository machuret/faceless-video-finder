
import { fetchFromYouTubeAPI } from './apiUtils.ts';
import { fetchChannelData } from './directExtractor.ts';

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
  const searchData = await fetchFromYouTubeAPI(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`,
    timestamp
  );
  
  if (!searchData.items || searchData.items.length === 0) {
    console.error(`❌ [${timestamp}] No channels found matching the search term`);
    throw new Error('No channels found matching the search term');
  }
  
  // Take the first result (most relevant)
  const channelId = searchData.items[0].id.channelId;
  console.log(`🔹 [${timestamp}] Found channel ID via search: ${channelId}`);
  
  // Use the shared function to get channel details
  return await fetchChannelData(channelId, YOUTUBE_API_KEY, timestamp);
}
