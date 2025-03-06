
/**
 * Helper function to make YouTube API requests with consistent error handling and optimized timeouts
 */
export async function fetchFromYouTubeAPI(url: string, timestamp: string) {
  console.log(`🔍 [${timestamp}] Fetching from YouTube API:`, url);
  
  try {
    // Set a specific timeout for each API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    try {
      const response = await fetch(url, { 
        headers: { 
          'Content-Type': 'application/json',
          // Add stronger cache control to prevent caching issues
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      });
      
      // Clear timeout as soon as response is received
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { status: response.status, statusText: response.statusText };
        }
        
        console.error(`❌ [${timestamp}] YouTube API error (${response.status}):`, errorData);
        
        // Format error message based on YouTube API error format
        const apiErrorMessage = errorData?.error?.message || 
                               errorData?.error?.errors?.[0]?.message ||
                               `API request failed with status ${response.status}`;
        
        throw new Error(`YouTube API error: ${apiErrorMessage}`);
      }
      
      // Parse the response immediately to avoid delays
      const data = await response.json();
      console.log(`✅ [${timestamp}] YouTube API response successful`);
      return data;
    } catch (error) {
      // Always clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Re-throw the error to be handled by the caller
      if (error.name === 'AbortError') {
        console.error(`❌ [${timestamp}] YouTube API request timed out`);
        throw new Error('YouTube API request timed out. Please try again.');
      }
      
      throw error;
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] Error fetching from YouTube API:`, error.message);
    throw error;
  }
}
