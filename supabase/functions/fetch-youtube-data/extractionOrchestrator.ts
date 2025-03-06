
import { createSuccessResponse, createErrorResponse } from './httpHelpers.ts';
import { fetchFromYouTubeAPI } from './apiUtils.ts';

/**
 * Ultra-simplified function to just extract a video title
 */
export async function extractChannelData(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    console.log(`[${timestamp}] 🔍 DEBUG: Starting most basic extraction for URL: ${url}`);

    // Extract video ID from URL - handle both regular and short URLs
    let videoId = null;
    if (url.includes('watch?v=')) {
      const match = url.match(/watch\?v=([^&]+)/);
      if (match) videoId = match[1];
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&/]+)/);
      if (match) videoId = match[1];
    } else if (url.includes('/c/')) {
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
    } else if (url.includes('@')) {
      // This is a handle URL, not a video URL
      console.log(`[${timestamp}] ⚠️ DEBUG: URL is a handle URL, not a video URL: ${url}`);
      return createSuccessResponse({
        basicInfo: {
          videoTitle: "Handle URL detected",
          channelTitle: url.includes('@') ? url : "Unknown handle",
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
