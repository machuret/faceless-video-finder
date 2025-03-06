
import { corsHeaders, createErrorResponse, createSuccessResponse } from './httpHelpers.ts';
import { fetchChannelDirectly, fetchChannelViaVideo, fetchChannelViaSearch } from './channelExtractors.ts';
import { formatChannelData } from './dataFormatters.ts';
import { createMockChannelData } from './mockData.ts';

// Reduced timeout to ensure we respond before edge function timeout
export const TIMEOUT_MS = 9000; // 9 second timeout

/**
 * Validates and processes the incoming request
 */
export async function handleRequest(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Processing request`);
  
  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`[${timestamp}] 📝 Request body:`, JSON.stringify(requestBody));
    } catch (parseError) {
      console.error(`[${timestamp}] ❌ Failed to parse request body:`, parseError);
      return createErrorResponse("Invalid JSON in request body", 400, timestamp);
    }

    // Handle test ping
    if (requestBody?.test === true) {
      console.log(`[${timestamp}] 🧪 Test request received with timestamp: ${requestBody.timestamp}`);
      return createSuccessResponse({ 
        message: "Edge function is working correctly", 
        receivedAt: timestamp,
        requestTimestamp: requestBody.timestamp
      }, timestamp);
    }

    // Use mock data if requested or if this is a repeated attempt
    if (requestBody?.url) {
      const attemptNumber = requestBody?.attempt || 1;
      const shouldUseMockData = requestBody?.allowMockData === true || attemptNumber > 1;
      
      if (shouldUseMockData) {
        console.log(`[${timestamp}] 🧪 Using mock data for URL: ${requestBody.url} (attempt: ${attemptNumber})`);
        const mockData = createMockChannelData(requestBody.url);
        return createSuccessResponse({ 
          channelData: mockData,
          isMockData: true,
          extractionMethod: "mock",
          attempt: attemptNumber
        }, timestamp);
      }
    }

    // Validate YouTube API key
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error(`[${timestamp}] ❌ YouTube API key not configured`);
      return createErrorResponse('YouTube API key not configured on the server', 500, timestamp);
    }
    console.log(`[${timestamp}] 🔑 API Key available`);

    // Validate URL
    const url = requestBody?.url;
    if (!url) {
      console.error(`[${timestamp}] ❌ URL is required`);
      return createErrorResponse('URL is required', 400, timestamp);
    }
    console.log(`[${timestamp}] 📝 Processing URL:`, url);

    // Attempt channel extraction
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
        console.log(`[${timestamp}] ⚠️ All extraction methods failed, returning mock data`);
        const mockData = createMockChannelData(url);
        return createSuccessResponse({ 
          channelData: mockData, 
          isMockData: true,
          extractionMethod: "mock_fallback",
          error: "All extraction methods failed"
        }, timestamp);
      }
    } catch (error) {
      console.error(`[${timestamp}] ❌ Error extracting channel data:`, error.message);
      
      // Return mock data on error
      console.log(`[${timestamp}] 🧪 Returning mock data due to error`);
      const mockData = createMockChannelData(url);
      return createSuccessResponse({ 
        channelData: mockData,
        isMockData: true,
        error: error.message,
        extractionMethod: "mock_error"
      }, timestamp);
    }
  } catch (error) {
    console.error(`[${timestamp}] ❌ Unhandled error:`, error.message);
    return createErrorResponse(error.message || 'Unknown server error', 500, timestamp);
  }
}
