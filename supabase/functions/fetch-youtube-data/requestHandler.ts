
import { corsHeaders, createErrorResponse, createSuccessResponse } from './httpHelpers.ts';
import { handleTestRequest } from './mockDataHandler.ts';
import { extractChannelData } from './extractionOrchestrator.ts';

/**
 * Simplified request handler with extensive debugging
 */
export async function handleRequest(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 DEBUG: Processing ultra-simplified request`);
  
  try {
    // Basic request parsing
    const requestBody = await req.json();
    console.log(`[${timestamp}] 📝 DEBUG: Request body:`, JSON.stringify(requestBody));

    // Handle test ping
    if (requestBody?.test === true) {
      console.log(`[${timestamp}] 🧪 DEBUG: Handling test request`);
      return handleTestRequest(requestBody.timestamp || timestamp, timestamp);
    }

    // For regular testing, just return basic info about the request
    if (requestBody?.ping === true) {
      console.log(`[${timestamp}] 🧪 DEBUG: Handling ping request`);
      return createSuccessResponse({
        message: "Edge function is working!",
        receivedBody: requestBody,
      }, timestamp);
    }

    // Get API key
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    console.log(`[${timestamp}] 🔑 DEBUG: API Key available:`, YOUTUBE_API_KEY ? "Yes" : "No");
    
    if (!YOUTUBE_API_KEY) {
      console.error(`[${timestamp}] ❌ DEBUG: YouTube API key not configured`);
      return createSuccessResponse({
        error: "YouTube API key not configured",
        basicInfo: {
          videoTitle: "Error: API key missing",
          channelTitle: "Configuration error",
          channelId: "Error",
          videoId: "Error"
        }
      }, timestamp);
    }

    // Validate URL
    const url = requestBody?.url;
    if (!url) {
      console.error(`[${timestamp}] ❌ DEBUG: URL is missing in request`);
      return createSuccessResponse({
        error: "URL is required",
        basicInfo: {
          videoTitle: "Error: URL missing",
          channelTitle: "Input error",
          channelId: "Error",
          videoId: "Error"
        }
      }, timestamp);
    }
    
    console.log(`[${timestamp}] 📝 DEBUG: Processing URL:`, url);

    // Extract minimum data with our simplified method
    return await extractChannelData(url, YOUTUBE_API_KEY, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ DEBUG: Unhandled error:`, error.message, error.stack);
    // Return a success response with error info
    return createSuccessResponse({
      error: error.message || "Unknown error",
      basicInfo: {
        videoTitle: `Critical error: ${error.message}`,
        channelTitle: "System error",
        channelId: "Error",
        videoId: "Error"
      }
    }, timestamp);
  }
}
