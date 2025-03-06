
import { createErrorResponse } from './httpHelpers.ts';

/**
 * Validates the incoming request body
 */
export function validateRequestBody(req: Request, timestamp: string) {
  try {
    return req.json();
  } catch (parseError) {
    console.error(`[${timestamp}] ❌ Failed to parse request body:`, parseError);
    throw new Error("Invalid JSON in request body");
  }
}

/**
 * Validates YouTube API key is available
 */
export function validateApiKey(timestamp: string) {
  const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  if (!YOUTUBE_API_KEY) {
    console.error(`[${timestamp}] ❌ YouTube API key not configured`);
    throw new Error('YouTube API key not configured on the server');
  }
  console.log(`[${timestamp}] 🔑 API Key available`);
  return YOUTUBE_API_KEY;
}

/**
 * Validates the URL in the request
 */
export function validateUrl(url: string, timestamp: string) {
  if (!url) {
    console.error(`[${timestamp}] ❌ URL is required`);
    throw new Error('URL is required');
  }
  console.log(`[${timestamp}] 📝 Processing URL:`, url);
  return url;
}
