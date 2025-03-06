
import { corsHeaders, createErrorResponse, createSuccessResponse } from './httpHelpers.ts';
import { fetchChannelDirectly, fetchChannelViaVideo, fetchChannelViaSearch } from './channelExtractors.ts';
import { formatChannelData } from './dataFormatters.ts';
import { createMockChannelData } from './mockData.ts';

// Reduce global timeout to ensure we respond before edge function timeout
export const TIMEOUT_MS = 7000; // 7 second timeout (reduced from 9s)

// Set individual method timeouts
const DIRECT_FETCH_TIMEOUT = 2500;   // 2.5 seconds (reduced from 3s)
const VIDEO_FETCH_TIMEOUT = 2000;    // 2 seconds (reduced from 2.5s)  
const SEARCH_FETCH_TIMEOUT = 1500;   // 1.5 seconds (reduced from 2s)

/**
 * Validates and processes the incoming request
 */
export async function handleRequest(req: Request) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Processing request`);
  
  // Set overall function timeout to avoid early drops
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => {
      const error = new Error("Function timeout reached");
      console.error(`[${timestamp}] ⏱️ Global timeout reached, responding with error`);
      reject(error);
    }, TIMEOUT_MS);
  }).catch(error => {
    return createErrorResponse("Request timed out. Please try again with a simpler URL.", 408, timestamp);
  });
  
  const processPromise = (async () => {
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

      // Prioritize mock data if available to avoid timeouts
      if (requestBody?.url) {
        // If allowMockData is explicitly true or if this is a repeated attempt, use mock data
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

      // Validate YouTube API key - fail fast if missing
      const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
      if (!YOUTUBE_API_KEY) {
        console.error(`[${timestamp}] ❌ YouTube API key not configured`);
        return createErrorResponse('YouTube API key not configured on the server. Please check edge function configuration.', 500, timestamp);
      }
      console.log(`[${timestamp}] 🔑 API Key exists and is properly configured`);

      // Validate URL - fail fast if missing
      const url = requestBody?.url;
      if (!url) {
        console.error(`[${timestamp}] ❌ URL is required but was not provided`);
        return createErrorResponse('URL is required', 400, timestamp);
      }
      console.log(`[${timestamp}] 📝 Processing URL:`, url);

      // Attempt channel extraction with stricter timeouts
      return await extractChannelData(url, YOUTUBE_API_KEY, !!requestBody?.allowMockData, timestamp);
      
    } catch (error) {
      console.error(`[${timestamp}] ❌ Unhandled error:`, error.message);
      return createErrorResponse(error.message || 'Unknown server error', 500, timestamp);
    }
  })();
  
  // Race between actual processing and timeout, with a slight advantage to processing
  // This helps ensure we get a result if processing finishes right around the timeout
  return Promise.race([
    processPromise,
    new Promise<Response>(resolve => {
      setTimeout(() => {
        // Don't resolve immediately, give processPromise a chance to complete first
        Promise.race([processPromise, new Promise(r => setTimeout(r, 50))])
          .then(resolve) 
          .catch(() => resolve(createErrorResponse("Request timed out", 408, timestamp)));
      }, TIMEOUT_MS - 100); // Give process a 100ms buffer
    })
  ]);
}

/**
 * Attempts to extract channel data using various methods with individual timeouts
 */
async function extractChannelData(url: string, YOUTUBE_API_KEY: string, allowMockData: boolean, timestamp: string) {
  console.log(`[${timestamp}] 🔍 Attempting channel extraction with optimized approach`);
  
  // Try direct extraction first with shorter timeout
  let channel = null;
  let channelId = null;
  let extractionMethod = "direct";
  
  try {
    console.log(`[${timestamp}] 🔍 Attempting direct extraction with ${DIRECT_FETCH_TIMEOUT}ms timeout`);
    
    // Create a promise that resolves with the direct extraction result or rejects on timeout
    const directPromise = fetchChannelDirectly(url, YOUTUBE_API_KEY);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Direct extraction timed out")), DIRECT_FETCH_TIMEOUT);
    });
    
    const result = await Promise.race([directPromise, timeoutPromise])
      .catch((directError) => {
        console.log(`[${timestamp}] ⚠️ Direct extraction failed or timed out:`, directError.message);
        return null;
      });
    
    if (result) {
      channel = result.channel;
      channelId = result.channelId;
      console.log(`[${timestamp}] ✅ Direct extraction succeeded`);
    }
  } catch (directError) {
    console.log(`[${timestamp}] ⚠️ Direct extraction failed:`, directError.message);
  }
  
  // If URL looks like a video, try video extraction with shorter timeout
  if (!channel && (url.includes('watch?v=') || url.includes('youtu.be'))) {
    try {
      extractionMethod = "video";
      console.log(`[${timestamp}] 🔍 Attempting extraction via video with ${VIDEO_FETCH_TIMEOUT}ms timeout`);
      
      // Create a promise that resolves with the video extraction result or rejects on timeout
      const videoPromise = fetchChannelViaVideo(url, YOUTUBE_API_KEY);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Video extraction timed out")), VIDEO_FETCH_TIMEOUT);
      });
      
      const result = await Promise.race([videoPromise, timeoutPromise])
        .catch((videoError) => {
          console.log(`[${timestamp}] ⚠️ Video extraction failed or timed out:`, videoError.message);
          return null;
        });
      
      if (result) {
        channel = result.channel;
        channelId = result.channelId;
        console.log(`[${timestamp}] ✅ Video extraction succeeded`);
      }
    } catch (videoError) {
      console.log(`[${timestamp}] ⚠️ Video extraction failed:`, videoError.message);
    }
  }
  
  // If still no result, try search as last resort with shortest timeout
  if (!channel) {
    try {
      extractionMethod = "search";
      console.log(`[${timestamp}] 🔍 Attempting extraction via search with ${SEARCH_FETCH_TIMEOUT}ms timeout`);
      
      // Create a promise that resolves with the search extraction result or rejects on timeout
      const searchPromise = fetchChannelViaSearch(url, YOUTUBE_API_KEY);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Search extraction timed out")), SEARCH_FETCH_TIMEOUT);
      });
      
      const result = await Promise.race([searchPromise, timeoutPromise])
        .catch((searchError) => {
          console.log(`[${timestamp}] ⚠️ Search extraction failed or timed out:`, searchError.message);
          return null;
        });
      
      if (result) {
        channel = result.channel;
        channelId = result.channelId;
        console.log(`[${timestamp}] ✅ Search extraction succeeded`);
      }
    } catch (searchError) {
      console.log(`[${timestamp}] ⚠️ Search extraction failed:`, searchError.message);
    }
  }
  
  // If no channel data found, return error or mock data
  if (!channel || !channelId) {
    console.error(`[${timestamp}] ❌ Failed to extract channel data using all methods`);
    
    // Always use mock data if extraction fails to ensure we return something
    console.log(`[${timestamp}] 🧪 Returning mock data as fallback`);
    const mockData = createMockChannelData(url);
    return createSuccessResponse({ 
      channelData: mockData,
      isMockData: true,
      error: "Failed to extract channel data using all methods",
      extractionMethod: "mock_fallback"
    }, timestamp);
  }

  // Format channel data
  const channelData = formatChannelData(channel, channelId);
  
  console.log(`[${timestamp}] ✅ Returning channel data for: ${channelData.title} (extraction method: ${extractionMethod})`);
  
  return createSuccessResponse({ 
    channelData,
    extractionMethod
  }, timestamp);
}
