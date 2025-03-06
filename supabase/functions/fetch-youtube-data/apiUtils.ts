
/**
 * Helper function to make YouTube API requests with consistent error handling and optimized timeouts
 */
export async function fetchFromYouTubeAPI(url: string, timestamp: string) {
  console.log(`🔍 [${timestamp}] DEBUG: Fetching from YouTube API:`, url);
  
  try {
    // Set a specific timeout for each API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout to be safe
    
    try {
      console.log(`🔍 [${timestamp}] DEBUG: Starting fetch for:`, url);
      const response = await fetch(url, { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      // Clear timeout as soon as response is received
      clearTimeout(timeoutId);
      console.log(`🔍 [${timestamp}] DEBUG: Received response with status:`, response.status);
      
      if (!response.ok) {
        console.error(`❌ [${timestamp}] DEBUG: YouTube API error (${response.status}):`, response.statusText);
        throw new Error(`YouTube API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      console.log(`✅ [${timestamp}] DEBUG: YouTube API response successful:`, JSON.stringify(data).substring(0, 200) + '...');
      return data;
    } catch (error) {
      // Always clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Re-throw the error to be handled by the caller
      if (error.name === 'AbortError') {
        console.error(`❌ [${timestamp}] DEBUG: YouTube API request timed out`);
        throw new Error('YouTube API request timed out');
      }
      
      throw error;
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] DEBUG: Error fetching from YouTube API:`, error.message);
    throw error;
  }
}
