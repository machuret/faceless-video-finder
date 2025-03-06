
import { corsHeaders, createErrorResponse, createSuccessResponse } from './httpHelpers.ts';
import { fetchChannelDirectly, fetchChannelViaVideo, fetchChannelViaSearch } from './channelExtractors.ts';
import { formatChannelData } from './dataFormatters.ts';
import { createMockChannelData } from './mockData.ts';

// Global timeout in milliseconds
export const TIMEOUT_MS = 15000; // 15 second timeout

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

    // Check for mock data request
    if (requestBody?.allowMockData === true && requestBody?.url) {
      console.log(`[${timestamp}] 🧪 Returning mock data for URL: ${requestBody.url}`);
      const mockData = createMockChannelData(requestBody.url);
      return createSuccessResponse({ 
        channelData: mockData,
        isMockData: true
      }, timestamp);
    }

    // Validate YouTube API key
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error(`[${timestamp}] ❌ YouTube API key not configured`);
      return createErrorResponse('YouTube API key not configured on the server. Please check edge function configuration.', 500, timestamp);
    }
    console.log(`[${timestamp}] 🔑 API Key exists and is properly configured`);

    // Validate URL
    const url = requestBody?.url;
    if (!url) {
      console.error(`[${timestamp}] ❌ URL is required but was not provided`);
      return createErrorResponse('URL is required', 400, timestamp);
    }
    console.log(`[${timestamp}] 📝 Processing URL:`, url);

    // Attempt channel extraction
    return await extractChannelData(url, YOUTUBE_API_KEY, requestBody?.allowMockData, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Unhandled error:`, error.message);
    return createErrorResponse(error.message || 'Unknown server error', 500, timestamp);
  }
}

/**
 * Attempts to extract channel data using various methods
 */
async function extractChannelData(url: string, YOUTUBE_API_KEY: string, allowMockData: boolean, timestamp: string) {
  console.log(`[${timestamp}] 🔍 Attempting channel extraction with simplified approach`);
  
  // Try direct extraction first
  let channel = null;
  let channelId = null;
  let extractionMethod = "direct";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const result = await fetchChannelDirectly(url, YOUTUBE_API_KEY);
    clearTimeout(timeoutId);
    
    channel = result.channel;
    channelId = result.channelId;
  } catch (directError) {
    console.log(`[${timestamp}] ⚠️ Direct extraction failed:`, directError.message);
    
    // If URL looks like a video, try video extraction
    if (url.includes('watch?v=') || url.includes('youtu.be')) {
      try {
        extractionMethod = "video";
        console.log(`[${timestamp}] 🔍 Attempting extraction via video`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const result = await fetchChannelViaVideo(url, YOUTUBE_API_KEY);
        clearTimeout(timeoutId);
        
        channel = result.channel;
        channelId = result.channelId;
      } catch (videoError) {
        console.log(`[${timestamp}] ⚠️ Video extraction failed:`, videoError.message);
      }
    }
    
    // If still no result, try search as last resort
    if (!channel) {
      try {
        extractionMethod = "search";
        console.log(`[${timestamp}] 🔍 Attempting extraction via search`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const result = await fetchChannelViaSearch(url, YOUTUBE_API_KEY);
        clearTimeout(timeoutId);
        
        channel = result.channel;
        channelId = result.channelId;
      } catch (searchError) {
        console.log(`[${timestamp}] ⚠️ Search extraction failed:`, searchError.message);
      }
    }
  }
  
  // If no channel data found, return error or mock data
  if (!channel || !channelId) {
    console.error(`[${timestamp}] ❌ Failed to extract channel data using all methods`);
    
    // For development purposes, return mock data if real extraction fails
    if (allowMockData === true) {
      console.log(`[${timestamp}] 🧪 Returning mock data as fallback`);
      const mockData = createMockChannelData(url);
      return createSuccessResponse({ 
        channelData: mockData,
        isMockData: true,
        error: "Failed to extract channel data"
      }, timestamp);
    }
    
    return createErrorResponse("Failed to extract channel data using all methods", 400, timestamp);
  }

  // Format channel data
  const channelData = formatChannelData(channel, channelId);
  
  console.log(`[${timestamp}] ✅ Returning channel data for: ${channelData.title} (extraction method: ${extractionMethod})`);
  
  return createSuccessResponse({ 
    channelData,
    extractionMethod
  }, timestamp);
}
