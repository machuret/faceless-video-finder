
import { fetchChannelDirectly, fetchChannelViaVideo, fetchChannelViaSearch } from './channelExtractors.ts';
import { formatChannelData } from './dataFormatters.ts';
import { createSuccessResponse } from './httpHelpers.ts';
import { handleExtractionFailure } from './mockDataHandler.ts';

/**
 * Orchestrates the different channel extraction methods
 */
export async function extractChannelData(url: string, YOUTUBE_API_KEY: string, timestamp: string) {
  try {
    // Try direct extraction first
    try {
      console.log(`[${timestamp}] 🔍 Attempting direct channel extraction`);
      const { channel, channelId } = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
      const channelData = formatChannelData(channel, channelId);
      console.log(`[${timestamp}] ✅ Direct extraction successful for: ${channelData.title}`);
      return createSuccessResponse({ channelData, extractionMethod: "direct" }, timestamp);
    } catch (directError) {
      console.log(`[${timestamp}] ⚠️ Direct extraction failed:`, directError.message);
      
      // If URL looks like a video, try video extraction
      if (url.includes('watch?v=') || url.includes('youtu.be')) {
        try {
          console.log(`[${timestamp}] 🔍 Attempting video extraction`);
          const { channel, channelId } = await fetchChannelViaVideo(url, YOUTUBE_API_KEY);
          const channelData = formatChannelData(channel, channelId);
          console.log(`[${timestamp}] ✅ Video extraction successful for: ${channelData.title}`);
          return createSuccessResponse({ channelData, extractionMethod: "video" }, timestamp);
        } catch (videoError) {
          console.log(`[${timestamp}] ⚠️ Video extraction failed:`, videoError.message);
        }
      }
      
      // Last resort: try search
      try {
        console.log(`[${timestamp}] 🔍 Attempting search extraction`);
        const { channel, channelId } = await fetchChannelViaSearch(url, YOUTUBE_API_KEY);
        const channelData = formatChannelData(channel, channelId);
        console.log(`[${timestamp}] ✅ Search extraction successful for: ${channelData.title}`);
        return createSuccessResponse({ channelData, extractionMethod: "search" }, timestamp);
      } catch (searchError) {
        console.log(`[${timestamp}] ⚠️ Search extraction failed:`, searchError.message);
      }
      
      // All extraction methods failed, return mock data
      return handleExtractionFailure(url, "All extraction methods failed", timestamp);
    }
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error extracting channel data:`, error.message);
    return handleExtractionFailure(url, error.message, timestamp);
  }
}
