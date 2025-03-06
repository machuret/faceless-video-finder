
/**
 * Helper function to make YouTube API requests with consistent error handling and optimized timeouts
 */
export async function fetchFromYouTubeAPI(url: string, timestamp: string) {
  console.log(`🔍 [${timestamp}] Fetching from YouTube API:`, url);
  
  try {
    // Set a specific timeout for each API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout to be safe
    
    try {
      console.log(`🔍 [${timestamp}] Starting fetch for:`, url);
      const response = await fetch(url, { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      // Clear timeout as soon as response is received
      clearTimeout(timeoutId);
      console.log(`🔍 [${timestamp}] Received response with status:`, response.status);
      
      if (!response.ok) {
        console.error(`❌ [${timestamp}] YouTube API error (${response.status}):`, response.statusText);
        throw new Error(`YouTube API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      console.log(`✅ [${timestamp}] YouTube API response successful with data keys:`, Object.keys(data));
      return data;
    } catch (error) {
      // Always clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Re-throw the error to be handled by the caller
      if (error.name === 'AbortError') {
        console.error(`❌ [${timestamp}] YouTube API request timed out`);
        throw new Error('YouTube API request timed out');
      }
      
      throw error;
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] Error fetching from YouTube API:`, error.message);
    throw error;
  }
}
