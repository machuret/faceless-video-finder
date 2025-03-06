
import { createSuccessResponse, createErrorResponse } from './httpHelpers.ts';
import { fetchFromYouTubeAPI } from './apiUtils.ts';

/**
 * Improved function to extract channel data from various YouTube URL formats
 * with extensive testing, logging, and error handling
 */
export async function extractChannelData(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    console.log(`[${timestamp}] 🔍 DEBUG: Starting extraction for URL: ${url}`);
    
    // Normalize URL (remove trailing slashes, lowercase)
    const normalizedUrl = url.trim().toLowerCase().replace(/\/+$/, '');
    console.log(`[${timestamp}] 🔍 DEBUG: Normalized URL: ${normalizedUrl}`);
    
    // Extract channel/video info based on URL format
    let result = null;
    
    // CHANNEL ID FORMAT: /channel/UC...
    if (normalizedUrl.includes('/channel/')) {
      console.log(`[${timestamp}] 🔍 DEBUG: Detected channel ID format`);
      result = await handleChannelIdUrl(normalizedUrl, YOUTUBE_API_KEY, timestamp);
    }
    // HANDLE FORMAT: @username or youtube.com/@username
    else if (normalizedUrl.includes('@')) {
      console.log(`[${timestamp}] 🔍 DEBUG: Detected handle format`);
      result = await handleHandleUrl(normalizedUrl, YOUTUBE_API_KEY, timestamp);
    }
    // CUSTOM CHANNEL FORMAT: /c/customname
    else if (normalizedUrl.includes('/c/')) {
      console.log(`[${timestamp}] 🔍 DEBUG: Detected custom channel format`);
      result = await handleCustomChannelUrl(normalizedUrl, YOUTUBE_API_KEY, timestamp);
    }
    // USER CHANNEL FORMAT: /user/username
    else if (normalizedUrl.includes('/user/')) {
      console.log(`[${timestamp}] 🔍 DEBUG: Detected user channel format`);
      result = await handleUserChannelUrl(normalizedUrl, YOUTUBE_API_KEY, timestamp);
    }
    // VIDEO FORMAT: watch?v=... or youtu.be/...
    else if (normalizedUrl.includes('watch?v=') || normalizedUrl.includes('youtu.be/')) {
      console.log(`[${timestamp}] 🔍 DEBUG: Detected video format`);
      result = await handleVideoUrl(normalizedUrl, YOUTUBE_API_KEY, timestamp);
    }
    // Last resort - try general search
    else {
      console.log(`[${timestamp}] 🔍 DEBUG: Unknown format, trying general search`);
      result = await handleGeneralSearch(normalizedUrl, YOUTUBE_API_KEY, timestamp);
    }
    
    // Return result if we got one
    if (result) {
      return result;
    }
    
    // Fallback if all else fails
    console.log(`[${timestamp}] ⚠️ DEBUG: All extraction methods failed for URL: ${url}`);
    return createSuccessResponse({
      basicInfo: {
        videoTitle: "Extraction failed",
        channelTitle: "Unknown format",
        channelId: "Unknown",
        videoId: "Unknown"
      },
      extractionMethod: "fallback",
      url: normalizedUrl
    }, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ DEBUG: Critical error in extraction:`, error.message, error.stack);
    return createSuccessResponse({
      basicInfo: {
        videoTitle: `Error: ${error.message}`,
        channelTitle: "Error occurred",
        channelId: "Error",
        videoId: "Error"
      },
      extractionMethod: "error",
      error: error.message,
      url
    }, timestamp);
  }
}

/**
 * Handle YouTube channel URLs with ID format: /channel/UC...
 */
async function handleChannelIdUrl(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    // Extract channel ID from URL
    const match = url.match(/channel\/([a-zA-Z0-9_-]+)/i);
    if (!match || !match[1]) {
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not extract channel ID from URL: ${url}`);
      return null;
    }
    
    const channelId = match[1];
    console.log(`[${timestamp}] 🔍 DEBUG: Extracted channel ID: ${channelId}`);
    
    // Fetch channel data
    const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Fetching channel data for ID: ${channelId}`);
    
    const channelData = await fetchFromYouTubeAPI(channelApiUrl, timestamp);
    
    if (!channelData.items || channelData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ DEBUG: No channel found with ID: ${channelId}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Channel not found",
          channelTitle: `Channel ID: ${channelId}`,
          channelId: channelId,
          videoId: "N/A"
        },
        extractionMethod: "channel_id_not_found",
        url
      }, timestamp);
    }
    
    const channel = channelData.items[0];
    const channelTitle = channel.snippet.title;
    
    console.log(`[${timestamp}] ✅ DEBUG: Successfully found channel: ${channelTitle} (${channelId})`);
    
    return createSuccessResponse({
      basicInfo: {
        videoTitle: "Channel Page",
        channelTitle: channelTitle,
        channelId: channelId,
        videoId: "N/A"
      },
      extractionMethod: "channel_id_direct",
      url,
      channelData: channel
    }, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ⚠️ DEBUG: Error in channel ID extraction:`, error.message);
    return null; // Let the main function handle fallback
  }
}

/**
 * Handle YouTube handle URLs: @username or youtube.com/@username
 */
async function handleHandleUrl(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    // Extract handle from URL
    let handle = '';
    
    if (url.includes('youtube.com/@')) {
      // Format: https://www.youtube.com/@username
      const match = url.match(/youtube\.com\/@([^\/\?]+)/i);
      if (match && match[1]) handle = match[1];
    } else if (url.startsWith('@')) {
      // Format: @username
      handle = url.substring(1);
    } else if (url.includes('@')) {
      // Format: something@username (less common)
      const parts = url.split('@');
      if (parts.length > 1) handle = parts[1].split(/[\/\?]/)[0];
    }
    
    if (!handle) {
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not extract handle from URL: ${url}`);
      return null;
    }
    
    console.log(`[${timestamp}] 🔍 DEBUG: Extracted handle: @${handle}`);
    
    // Try to get channel info via search API
    const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handle)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Searching for channel with handle: @${handle}`);
    
    const searchData = await fetchFromYouTubeAPI(searchApiUrl, timestamp);
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ DEBUG: No channel found with handle: @${handle}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Handle not found",
          channelTitle: `@${handle}`,
          channelId: "Unknown",
          videoId: "Unknown"
        },
        extractionMethod: "handle_not_found",
        url
      }, timestamp);
    }
    
    const channelId = searchData.items[0].id.channelId;
    const channelTitle = searchData.items[0].snippet.title;
    
    console.log(`[${timestamp}] ✅ DEBUG: Found channel via handle: ${channelTitle} (${channelId})`);
    
    // Get full channel info
    const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Fetching complete channel data for ID: ${channelId}`);
    
    const channelData = await fetchFromYouTubeAPI(channelApiUrl, timestamp);
    
    if (!channelData.items || channelData.items.length === 0) {
      // Fallback to search results if full channel fetch fails
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not fetch full channel data, using search results`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Found via handle search",
          channelTitle: channelTitle,
          channelId: channelId,
          videoId: "N/A"
        },
        extractionMethod: "handle_search_basic",
        url
      }, timestamp);
    }
    
    const channel = channelData.items[0];
    
    console.log(`[${timestamp}] ✅ DEBUG: Successfully fetched complete channel data for: ${channelTitle}`);
    
    return createSuccessResponse({
      basicInfo: {
        videoTitle: "Found via handle",
        channelTitle: channelTitle,
        channelId: channelId,
        videoId: "N/A"
      },
      extractionMethod: "handle_full",
      url,
      channelData: channel
    }, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ⚠️ DEBUG: Error in handle extraction:`, error.message);
    return null; // Let the main function handle fallback
  }
}

/**
 * Handle YouTube custom channel URLs: youtube.com/c/channelname
 */
async function handleCustomChannelUrl(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    // Extract custom channel name
    const match = url.match(/\/c\/([^\/\?]+)/i);
    if (!match || !match[1]) {
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not extract custom channel name from URL: ${url}`);
      return null;
    }
    
    const customName = match[1];
    console.log(`[${timestamp}] 🔍 DEBUG: Extracted custom channel name: ${customName}`);
    
    // Search for the channel
    const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(customName)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Searching for custom channel: ${customName}`);
    
    const searchData = await fetchFromYouTubeAPI(searchApiUrl, timestamp);
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ DEBUG: No channel found with custom name: ${customName}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Custom channel not found",
          channelTitle: customName,
          channelId: "Unknown",
          videoId: "Unknown"
        },
        extractionMethod: "custom_channel_not_found",
        url
      }, timestamp);
    }
    
    const channelId = searchData.items[0].id.channelId;
    const channelTitle = searchData.items[0].snippet.title;
    
    console.log(`[${timestamp}] ✅ DEBUG: Found channel via custom URL: ${channelTitle} (${channelId})`);
    
    // Get full channel info
    const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Fetching complete channel data for ID: ${channelId}`);
    
    const channelData = await fetchFromYouTubeAPI(channelApiUrl, timestamp);
    
    if (!channelData.items || channelData.items.length === 0) {
      // Fallback to search results if full channel fetch fails
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not fetch full channel data, using search results`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Channel Page",
          channelTitle: channelTitle,
          channelId: channelId,
          videoId: "N/A"
        },
        extractionMethod: "custom_channel_search_basic",
        url
      }, timestamp);
    }
    
    const channel = channelData.items[0];
    
    console.log(`[${timestamp}] ✅ DEBUG: Successfully fetched complete channel data for: ${channelTitle}`);
    
    return createSuccessResponse({
      basicInfo: {
        videoTitle: "Channel Page",
        channelTitle: channelTitle,
        channelId: channelId,
        videoId: "N/A"
      },
      extractionMethod: "custom_channel_full",
      url,
      channelData: channel
    }, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ⚠️ DEBUG: Error in custom channel extraction:`, error.message);
    return null; // Let the main function handle fallback
  }
}

/**
 * Handle YouTube user channel URLs: youtube.com/user/username
 */
async function handleUserChannelUrl(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    // Extract username
    const match = url.match(/\/user\/([^\/\?]+)/i);
    if (!match || !match[1]) {
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not extract username from URL: ${url}`);
      return null;
    }
    
    const username = match[1];
    console.log(`[${timestamp}] 🔍 DEBUG: Extracted username: ${username}`);
    
    // Search for the channel
    const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(username)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Searching for user channel: ${username}`);
    
    const searchData = await fetchFromYouTubeAPI(searchApiUrl, timestamp);
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ DEBUG: No channel found with username: ${username}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "User channel not found",
          channelTitle: username,
          channelId: "Unknown",
          videoId: "Unknown"
        },
        extractionMethod: "user_channel_not_found",
        url
      }, timestamp);
    }
    
    const channelId = searchData.items[0].id.channelId;
    const channelTitle = searchData.items[0].snippet.title;
    
    console.log(`[${timestamp}] ✅ DEBUG: Found channel via username: ${channelTitle} (${channelId})`);
    
    // Get full channel info
    const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Fetching complete channel data for ID: ${channelId}`);
    
    const channelData = await fetchFromYouTubeAPI(channelApiUrl, timestamp);
    
    if (!channelData.items || channelData.items.length === 0) {
      // Fallback to search results if full channel fetch fails
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not fetch full channel data, using search results`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Channel Page",
          channelTitle: channelTitle,
          channelId: channelId,
          videoId: "N/A"
        },
        extractionMethod: "user_channel_search_basic",
        url
      }, timestamp);
    }
    
    const channel = channelData.items[0];
    
    console.log(`[${timestamp}] ✅ DEBUG: Successfully fetched complete channel data for: ${channelTitle}`);
    
    return createSuccessResponse({
      basicInfo: {
        videoTitle: "Channel Page",
        channelTitle: channelTitle,
        channelId: channelId,
        videoId: "N/A"
      },
      extractionMethod: "user_channel_full",
      url,
      channelData: channel
    }, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ⚠️ DEBUG: Error in user channel extraction:`, error.message);
    return null; // Let the main function handle fallback
  }
}

/**
 * Handle YouTube video URLs: watch?v=videoId or youtu.be/videoId
 */
async function handleVideoUrl(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    // Extract video ID from the URL
    let videoId = null;
    
    if (url.includes('watch?v=')) {
      // Format: youtube.com/watch?v=videoId
      const match = url.match(/watch\?v=([^&]+)/i);
      if (match && match[1]) videoId = match[1];
    } else if (url.includes('youtu.be/')) {
      // Format: youtu.be/videoId
      const match = url.match(/youtu\.be\/([^?&/]+)/i);
      if (match && match[1]) videoId = match[1];
    }
    
    if (!videoId) {
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not extract video ID from URL: ${url}`);
      return null;
    }
    
    console.log(`[${timestamp}] 🔍 DEBUG: Extracted video ID: ${videoId}`);
    
    // Get video details
    const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Fetching video details for ID: ${videoId}`);
    
    const videoData = await fetchFromYouTubeAPI(videoApiUrl, timestamp);
    
    if (!videoData.items || videoData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ DEBUG: No video found with ID: ${videoId}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Video not found",
          channelTitle: "Unknown",
          channelId: "Unknown",
          videoId: videoId
        },
        extractionMethod: "video_not_found",
        url
      }, timestamp);
    }
    
    const video = videoData.items[0];
    const videoTitle = video.snippet.title;
    const channelTitle = video.snippet.channelTitle;
    const channelId = video.snippet.channelId;
    
    console.log(`[${timestamp}] ✅ DEBUG: Found video: "${videoTitle}" by ${channelTitle} (${channelId})`);
    
    // Get full channel info
    const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Fetching complete channel data for ID: ${channelId}`);
    
    const channelData = await fetchFromYouTubeAPI(channelApiUrl, timestamp);
    
    if (!channelData.items || channelData.items.length === 0) {
      // Fallback to video snippet if full channel fetch fails
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not fetch full channel data, using video snippet`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: videoTitle,
          channelTitle: channelTitle,
          channelId: channelId,
          videoId: videoId
        },
        extractionMethod: "video_basic",
        url
      }, timestamp);
    }
    
    const channel = channelData.items[0];
    
    console.log(`[${timestamp}] ✅ DEBUG: Successfully fetched complete channel data for: ${channelTitle}`);
    
    return createSuccessResponse({
      basicInfo: {
        videoTitle: videoTitle,
        channelTitle: channelTitle,
        channelId: channelId,
        videoId: videoId
      },
      extractionMethod: "video_full",
      url,
      videoData: video,
      channelData: channel
    }, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ⚠️ DEBUG: Error in video extraction:`, error.message);
    return null; // Let the main function handle fallback
  }
}

/**
 * Handle general search for unknown URL formats
 */
async function handleGeneralSearch(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    // Extract search term from URL
    let searchTerm = url.replace(/https?:\/\/(www\.)?youtube\.com\/?/, '').replace(/\//g, ' ').trim();
    
    // If search term is empty, use the whole URL
    if (!searchTerm) searchTerm = url;
    
    console.log(`[${timestamp}] 🔍 DEBUG: Using general search with term: ${searchTerm}`);
    
    // Search for channels matching the term
    const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
    
    const searchData = await fetchFromYouTubeAPI(searchApiUrl, timestamp);
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ DEBUG: No channels found with search term: ${searchTerm}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "No search results",
          channelTitle: "Unknown",
          channelId: "Unknown",
          videoId: "Unknown"
        },
        extractionMethod: "general_search_failed",
        url
      }, timestamp);
    }
    
    const channelId = searchData.items[0].id.channelId;
    const channelTitle = searchData.items[0].snippet.title;
    
    console.log(`[${timestamp}] ✅ DEBUG: Found channel via general search: ${channelTitle} (${channelId})`);
    
    // Get full channel info
    const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Fetching complete channel data for ID: ${channelId}`);
    
    const channelData = await fetchFromYouTubeAPI(channelApiUrl, timestamp);
    
    if (!channelData.items || channelData.items.length === 0) {
      // Fallback to search results if full channel fetch fails
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not fetch full channel data, using search results`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Found via general search",
          channelTitle: channelTitle,
          channelId: channelId,
          videoId: "N/A"
        },
        extractionMethod: "general_search_basic",
        url
      }, timestamp);
    }
    
    const channel = channelData.items[0];
    
    console.log(`[${timestamp}] ✅ DEBUG: Successfully fetched complete channel data for: ${channelTitle}`);
    
    return createSuccessResponse({
      basicInfo: {
        videoTitle: "Found via general search",
        channelTitle: channelTitle,
        channelId: channelId,
        videoId: "N/A"
      },
      extractionMethod: "general_search_full",
      url,
      channelData: channel
    }, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ⚠️ DEBUG: Error in general search:`, error.message);
    return null; // Let the main function handle fallback
  }
}
