
// Function to take screenshots via Apify's Screenshot URL Actor
export async function takeScreenshotViaAPI(url: string): Promise<ArrayBuffer | null> {
  try {
    console.log("Taking screenshot via Apify Screenshot URL actor:", url);
    
    // Get API key from environment
    const apiKey = Deno.env.get("APIFY_API_KEY") || Deno.env.get("APIFY_API_TOKEN");
    if (!apiKey) {
      console.error("APIFY_API_KEY not configured");
      throw new Error("Apify API key not configured");
    }
    
    // Prepare the Apify Actor input
    const input = {
      "urls": [
        {
          "url": url,
          "fullPage": false,
          "saveImages": true,
          "screenshotQuality": 85,
          "ignoreCookieBanners": true
        }
      ],
      "format": "png",
      "waitUntil": "networkidle2",
      "delay": 15000, // Increased delay to 15 seconds
      "viewportWidth": 1366,
      "viewportHeight": 768,
      "scrollToBottom": false,
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
      },
      "debugLog": true
    };
    
    console.log("Calling Apify Screenshot URL actor with input:", JSON.stringify(input, null, 2));
    
    // Use the Apify API to run Screenshot URL actor synchronously
    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~screenshot-url/run-sync?token=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Apify Screenshot URL actor error:", response.status, response.statusText);
      console.error("Error response body:", errorText);
      throw new Error(`Apify Screenshot URL actor returned ${response.status}: ${errorText || response.statusText}`);
    }
    
    // The response should be a JSON with a "data" field containing items
    const responseData = await response.json();
    console.log(`Apify response status: ${response.status}`);
    console.log(`Received Apify response data - item count: ${responseData.items?.length || 0}`);
    
    // If no items were returned, throw an error
    if (!responseData || !responseData.items || responseData.items.length === 0) {
      console.error("No screenshot data returned from Apify");
      throw new Error("No screenshot data returned from Apify");
    }
    
    // Get the screenshot URL from the first item
    const screenshotUrl = responseData.items[0]?.screenshotUrl;
    if (!screenshotUrl) {
      console.error("No screenshot URL found in Apify response");
      const responseDataString = JSON.stringify(responseData).substring(0, 500);
      console.error(`Response data preview: ${responseDataString}...`);
      throw new Error("No screenshot URL found in Apify response");
    }
    
    console.log("Screenshot URL from Apify:", screenshotUrl);
    
    // Fetch the actual screenshot image from the URL
    const imageResponse = await fetch(screenshotUrl);
    if (!imageResponse.ok) {
      console.error("Error fetching screenshot image:", imageResponse.status, imageResponse.statusText);
      throw new Error(`Error fetching screenshot image: ${imageResponse.status}`);
    }
    
    console.log("Screenshot image fetched successfully");
    return await imageResponse.arrayBuffer();
  } catch (err) {
    console.error("Error taking screenshot via Apify API:", err);
    return null;
  }
}
