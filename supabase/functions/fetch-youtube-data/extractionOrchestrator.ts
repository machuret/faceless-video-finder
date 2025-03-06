
import { createSuccessResponse, createErrorResponse } from './httpHelpers.ts';
import { handleExtractionFailure } from './mockDataHandler.ts';
import { fetchFromYouTubeAPI } from './apiUtils.ts';

/**
 * Simplified function to just extract a video title
 */
export async function extractChannelData(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    console.log(`[${timestamp}] 🔍 Attempting simplified video extraction for URL: ${url}`);

    // Extract video ID (handle both regular and short URLs)
    let videoId = null;
    if (url.includes('watch?v=')) {
      const match = url.match(/watch\?v=([^&]+)/);
      if (match) videoId = match[1];
    } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&/]+)/);
      if (match) videoId = match[1];
    }

    if (!videoId) {
      console.log(`[${timestamp}] ⚠️ Could not extract video ID from URL: ${url}`);
      return createErrorResponse('Could not extract video ID from URL', 400, timestamp);
    }

    console.log(`[${timestamp}] 🔍 Extracted video ID: ${videoId}, fetching details...`);

    // Make a simple request to the videos endpoint to get the title
    const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const videoData = await fetchFromYouTubeAPI(videoApiUrl, timestamp);

    // Check if we got any results
    if (!videoData.items || videoData.items.length === 0) {
      console.log(`[${timestamp}] ⚠️ No video found with ID: ${videoId}`);
      return createErrorResponse('No video found with that ID', 404, timestamp);
    }

    // Extract just the basic info we need
    const videoTitle = videoData.items[0].snippet.title;
    const channelTitle = videoData.items[0].snippet.channelTitle;
    const channelId = videoData.items[0].snippet.channelId;

    console.log(`[${timestamp}] ✅ Successfully fetched video info:`, {
      videoTitle,
      channelTitle,
      channelId
    });

    // Return just the basic info
    return createSuccessResponse({
      basicInfo: {
        videoTitle,
        channelTitle,
        channelId,
        videoId
      },
      extractionMethod: "simplified",
      url
    }, timestamp);

  } catch (error) {
    console.error(`[${timestamp}] ❌ Error in simplified extraction:`, error.message);
    // Return error with detailed message for debugging
    return createErrorResponse(
      `Extraction error: ${error.message}`, 
      500, 
      timestamp
    );
  }
}
