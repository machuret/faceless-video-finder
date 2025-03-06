
import { corsHeaders, createErrorResponse } from './httpHelpers.ts';
import { validateRequestBody, validateApiKey, validateUrl } from './requestValidator.ts';
import { handleTestRequest, handleMockDataRequest } from './mockDataHandler.ts';
import { extractChannelData } from './extractionOrchestrator.ts';

// Reduced timeout to ensure we respond before edge function timeout
export const TIMEOUT_MS = 8000; // 8 second timeout

/**
 * Simpler version of the request handler
 */
export async function handleRequest(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Processing simplified request`);
  
  try {
    // Basic request body validation
    const requestBody = await req.json();
    console.log(`[${timestamp}] 📝 Request body:`, JSON.stringify(requestBody));

    // Handle test ping
    if (requestBody?.test === true) {
      return handleTestRequest(requestBody.timestamp || timestamp, timestamp);
    }

    // Use mock data if requested
    if (requestBody?.allowMockData === true) {
      return handleMockDataRequest(requestBody.url || "", requestBody.attempt || 1, timestamp);
    }

    // Get API key
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      console.error(`[${timestamp}] ❌ YouTube API key not configured`);
      return createErrorResponse('YouTube API key not configured', 500, timestamp);
    }
    console.log(`[${timestamp}] 🔑 API Key available`);

    // Validate URL
    const url = requestBody?.url;
    if (!url) {
      console.error(`[${timestamp}] ❌ URL is missing in request`);
      return createErrorResponse('URL is required', 400, timestamp);
    }
    console.log(`[${timestamp}] 📝 Processing URL:`, url);

    // Extract data with our simplified method
    return await extractChannelData(url, YOUTUBE_API_KEY, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Unhandled error:`, error.message, error.stack);
    return createErrorResponse(error.message || 'Unknown error', 500, timestamp);
  }
}
