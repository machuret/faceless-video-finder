
import { corsHeaders, createErrorResponse } from './httpHelpers.ts';
import { validateRequestBody, validateApiKey, validateUrl } from './requestValidator.ts';
import { handleTestRequest, handleMockDataRequest } from './mockDataHandler.ts';
import { extractChannelData } from './extractionOrchestrator.ts';

// Reduced timeout to ensure we respond before edge function timeout
export const TIMEOUT_MS = 9000; // 9 second timeout

/**
 * Validates and processes the incoming request
 */
export async function handleRequest(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Processing request`);
  
  try {
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await validateRequestBody(req, timestamp);
      console.log(`[${timestamp}] 📝 Request body:`, JSON.stringify(requestBody));
    } catch (error) {
      return createErrorResponse(error.message, 400, timestamp);
    }

    // Handle test ping
    if (requestBody?.test === true) {
      return handleTestRequest(requestBody.timestamp, timestamp);
    }

    // Use mock data if requested or if this is a repeated attempt
    if (requestBody?.url) {
      const attemptNumber = requestBody?.attempt || 1;
      const shouldUseMockData = requestBody?.allowMockData === true || attemptNumber > 1;
      
      if (shouldUseMockData) {
        return handleMockDataRequest(requestBody.url, attemptNumber, timestamp);
      }
    }

    // Validate YouTube API key
    let YOUTUBE_API_KEY;
    try {
      YOUTUBE_API_KEY = validateApiKey(timestamp);
    } catch (error) {
      return createErrorResponse(error.message, 500, timestamp);
    }

    // Validate URL
    let url;
    try {
      url = validateUrl(requestBody?.url, timestamp);
    } catch (error) {
      return createErrorResponse(error.message, 400, timestamp);
    }

    // Extract channel data
    return await extractChannelData(url, YOUTUBE_API_KEY, timestamp);
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Unhandled error:`, error.message);
    return createErrorResponse(error.message || 'Unknown server error', 500, timestamp);
  }
}
