
// Function to take screenshots via screenshotapi.net
export async function takeScreenshotViaAPI(url: string): Promise<ArrayBuffer | null> {
  try {
    console.log("Taking screenshot via screenshotapi.net:", url);
    
    // Get API key from environment
    const apiKey = Deno.env.get("SCREENSHOT_API_KEY");
    if (!apiKey) {
      console.error("SCREENSHOT_API_KEY not configured");
      throw new Error("Screenshot API key not configured");
    }
    
    // Prepare the API request
    const encodedUrl = encodeURIComponent(url);
    const output = "image";
    const fileType = "png";
    
    // Set parameters to handle YouTube's consent screen
    const delay = 5000; // 5 seconds delay to ensure page is fully loaded
    const fullPage = false; // Get only the first viewport
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const width = 1366; // Common desktop width
    const height = 768; // Common desktop height
    
    // Try to optimize the URL to target channel page specifically
    let optimizedUrl = url;
    if (url.includes("youtube.com/channel/") || url.includes("youtube.com/c/") || url.includes("youtube.com/@")) {
      // Add /featured to go directly to channel homepage
      if (!url.endsWith("/")) {
        optimizedUrl = url + "/featured";
      } else {
        optimizedUrl = url + "featured";
      }
      console.log("Optimized URL for screenshot:", optimizedUrl);
    }
    
    const encodedOptimizedUrl = encodeURIComponent(optimizedUrl);
    
    // Set the YouTube consent cookie directly - this is the key improvement
    // SOCS cookie value that indicates consent has been given
    const cookies = "SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg";
    
    // Construct the API URL with the cookie parameter
    const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${apiKey}&url=${encodedOptimizedUrl}&output=${output}&file_type=${fileType}&delay=${delay}&full_page=${fullPage}&user_agent=${encodeURIComponent(userAgent)}&width=${width}&height=${height}&cookies=${encodeURIComponent(cookies)}`;
    
    console.log("Calling screenshot API with YouTube consent cookie");
    
    // Make the request to the screenshot API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error("Screenshot API error:", response.status, response.statusText);
      throw new Error(`Screenshot API returned ${response.status}: ${response.statusText}`);
    }
    
    console.log("Screenshot API response received");
    return await response.arrayBuffer();
  } catch (err) {
    console.error("Error taking screenshot via API:", err);
    return null;
  }
}
