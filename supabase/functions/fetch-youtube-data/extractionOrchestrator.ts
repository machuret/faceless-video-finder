import { createSuccessResponse, createErrorResponse } from './httpHelpers.ts';
import { fetchFromYouTubeAPI } from './apiUtils.ts';

/**
 * Ultra-simplified function to just extract a video title
 */
export async function extractChannelData(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    console.log(`[${timestamp}] 🔍 DEBUG: Starting most basic extraction for URL: ${url}`);

    // Handle URL is a special case
    if (url.includes('@')) {
      console.log(`[${timestamp}] 🔍 DEBUG: Detected handle URL: ${url}`);
      // Extract handle from URL
      let handle = '';
      if (url.includes('youtube.com/@')) {
        // Format: https://www.youtube.com/@username
        const match = url.match(/youtube\.com\/@([^\/\?]+)/);
        if (match && match[1]) handle = match[1];
      } else if (url.startsWith('@')) {
        // Format: @username
        handle = url.substring(1);
      }
      
      console.log(`[${timestamp}] 🔍 DEBUG: Extracted handle: ${handle}`);
      
      if (handle) {
        try {
          // Try to get channel info via search API
          const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handle)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
          console.log(`[${timestamp}] 🔍 DEBUG: Searching for channel with handle: @${handle}`);
          
          const searchData = await fetchFromYouTubeAPI(searchApiUrl, timestamp);
          
          if (searchData.items && searchData.items.length > 0) {
            const channelId = searchData.items[0].id.channelId;
            const channelTitle = searchData.items[0].snippet.title;
            
            console.log(`[${timestamp}] ✅ DEBUG: Found channel via handle: ${channelId}, ${channelTitle}`);
            
            return createSuccessResponse({
              basicInfo: {
                videoTitle: "Found via handle search",
                channelTitle: channelTitle,
                channelId: channelId,
                videoId: "N/A"
              },
              extractionMethod: "handle_search",
              url
            }, timestamp);
          }
        } catch (searchError) {
          console.error(`[${timestamp}] ⚠️ DEBUG: Error searching channel by handle:`, searchError.message);
          // Continue with basic info if search fails
        }
      }
      
      // Fallback if we couldn't get channel data via search
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Handle URL detected",
          channelTitle: handle || url,
          channelId: "Unknown",
          videoId: "Unknown"
        },
        extractionMethod: "handle_basic",
        url
      }, timestamp);
    }

    // Extract video ID from URL - handle both regular and short URLs
    let videoId = null;
    if (url.includes('watch?v=')) {
      const match = url.match(/watch\?v=([^&]+)/);
      if (match) videoId = match[1];
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&/]+)/);
      if (match) videoId = match[1];
    } else if (url.includes('/c/') || url.includes('/channel/')) {
      // This is a channel URL, not a video URL
      console.log(`[${timestamp}] ⚠️ DEBUG: URL is a channel URL, not a video URL: ${url}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Channel URL detected",
          channelTitle: "Unknown channel",
          channelId: "Unknown",
          videoId: "Unknown"
        },
        extractionMethod: "simplified",
        url
      }, timestamp);
    }

    if (!videoId) {
      console.log(`[${timestamp}] ⚠️ DEBUG: Could not extract video ID from URL: ${url}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Cannot extract video ID",
          channelTitle: "Unknown",
          channelId: "Unknown",
          videoId: "Unknown"
        },
        extractionMethod: "minimal",
        url
      }, timestamp);
    }

    console.log(`[${timestamp}] 🔍 DEBUG: Extracted video ID: ${videoId}, fetching video details...`);

    // Make a simple request to the videos endpoint to get the title
    const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    console.log(`[${timestamp}] 🔍 DEBUG: Calling YouTube API with URL: ${videoApiUrl.replace(YOUTUBE_API_KEY, 'REDACTED')}`);
    
    const videoData = await fetchFromYouTubeAPI(videoApiUrl, timestamp);
    console.log(`[${timestamp}] 🔍 DEBUG: Received video data:`, JSON.stringify(videoData).substring(0, 200) + '...');

    // Check if we got any results
    if (!videoData.items || videoData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ DEBUG: No video found with ID: ${videoId}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "No video found",
          channelTitle: "Unknown",
          channelId: "Unknown",
          videoId: videoId
        },
        extractionMethod: "minimal",
        url
      }, timestamp);
    }

    // Extract just the basic info we need
    const videoTitle = videoData.items[0].snippet.title;
    const channelTitle = videoData.items[0].snippet.channelTitle;
    const channelId = videoData.items[0].snippet.channelId;

    console.log(`[${timestamp}] ✅ DEBUG: Successfully fetched video info:`, {
      videoTitle,
      channelTitle,
      channelId,
      videoId
    });

    // Return just the basic info
    return createSuccessResponse({
      basicInfo: {
        videoTitle,
        channelTitle,
        channelId,
        videoId
      },
      extractionMethod: "minimal",
      url
    }, timestamp);

  } catch (error) {
    console.error(`[${timestamp}] ❌ DEBUG: Error in simplified extraction:`, error.message);
    // Return a success response with error info instead of an error response
    // This way we can see the error in the client
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
