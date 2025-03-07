
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
      "delay": 5000, // 5 seconds delay
      "viewportWidth": 1366,
      "viewportHeight": 768,
      "scrollToBottom": false,
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"]
      }
    };
    
    console.log("Calling Apify Screenshot URL actor with input:", JSON.stringify(input, null, 2));
    
    // Use fetch API to call Apify API directly
    const apiUrl = `https://api.apify.com/v2/acts/apify~screenshot-url/runs?token=${apiKey}`;
    
    // Start the actor run
    let startResponse;
    try {
      startResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      });
    } catch (error) {
      console.error("Network error when calling Apify API:", error);
      throw new Error(`Network error when calling Apify API: ${error.message}`);
    }
    
    if (!startResponse.ok) {
      let errorText;
      try {
        errorText = await startResponse.text();
      } catch (e) {
        errorText = "Could not read error response";
      }
      console.error("Apify API error when starting actor:", startResponse.status, startResponse.statusText);
      console.error("Error response:", errorText);
      throw new Error(`Apify API error: ${startResponse.status} ${errorText || startResponse.statusText}`);
    }
    
    // Parse the response to get the run ID
    let runData;
    try {
      runData = await startResponse.json();
    } catch (error) {
      console.error("Error parsing Apify API response:", error);
      throw new Error(`Error parsing Apify API response: ${error.message}`);
    }
    
    const runId = runData.data?.id;
    
    if (!runId) {
      console.error("No run ID returned from Apify");
      console.error("Response:", JSON.stringify(runData));
      throw new Error("No run ID returned from Apify");
    }
    
    console.log(`Apify actor run started with ID: ${runId}`);
    
    // Poll for the run status until it's completed
    let isFinished = false;
    let maxAttempts = 45; // Increased to 45 attempts with 2 second delay = max 90 second wait
    let attempts = 0;
    
    while (!isFinished && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
      
      console.log(`Checking run status (attempt ${attempts}/${maxAttempts})...`);
      
      let statusResponse;
      try {
        statusResponse = await fetch(
          `https://api.apify.com/v2/acts/apify~screenshot-url/runs/${runId}?token=${apiKey}`
        );
      } catch (error) {
        console.error(`Network error checking run status (attempt ${attempts}):`, error);
        continue; // Try again
      }
      
      if (!statusResponse.ok) {
        console.error(`Error checking run status: ${statusResponse.status}`);
        continue; // Try again
      }
      
      let statusData;
      try {
        statusData = await statusResponse.json();
      } catch (error) {
        console.error(`Error parsing status response (attempt ${attempts}):`, error);
        continue; // Try again
      }
      
      const status = statusData.data?.status;
      
      console.log(`Run status: ${status}`);
      
      if (status === 'SUCCEEDED') {
        isFinished = true;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Apify run failed with status: ${status}`);
      }
    }
    
    if (!isFinished) {
      throw new Error("Apify run timed out or did not complete");
    }
    
    // Get the dataset items from the successful run
    let datasetResponse;
    try {
      datasetResponse = await fetch(
        `https://api.apify.com/v2/acts/apify~screenshot-url/runs/${runId}/dataset/items?token=${apiKey}`
      );
    } catch (error) {
      console.error("Network error fetching dataset:", error);
      throw new Error(`Network error fetching dataset: ${error.message}`);
    }
    
    if (!datasetResponse.ok) {
      let errorText;
      try {
        errorText = await datasetResponse.text();
      } catch (e) {
        errorText = "Could not read error response";
      }
      console.error("Error fetching dataset:", datasetResponse.status, datasetResponse.statusText);
      console.error("Error response:", errorText);
      throw new Error(`Error fetching dataset: ${datasetResponse.status}`);
    }
    
    let items;
    try {
      items = await datasetResponse.json();
    } catch (error) {
      console.error("Error parsing dataset JSON:", error);
      throw new Error(`Error parsing dataset JSON: ${error.message}`);
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("No items found in dataset");
      throw new Error("No screenshots found in the dataset");
    }
    
    console.log(`Found ${items.length} items in dataset`);
    
    // Get the screenshot URL from the first item
    const screenshotUrl = items[0].screenshotUrl || items[0].url || items[0].resultUrl;
    if (!screenshotUrl) {
      console.error("No screenshot URL found in items");
      console.error("Items:", JSON.stringify(items));
      
      // Check for direct key-value store URLs in logs
      if (runData.data?.defaultKeyValueStoreId) {
        const keyValueStoreId = runData.data.defaultKeyValueStoreId;
        console.log(`Attempting to fetch from key-value store: ${keyValueStoreId}`);
        
        // Get the key-value store contents
        const kvStoreResponse = await fetch(
          `https://api.apify.com/v2/key-value-stores/${keyValueStoreId}/records?token=${apiKey}`
        );
        
        if (kvStoreResponse.ok) {
          const kvItems = await kvStoreResponse.json();
          console.log("Key-value store items:", JSON.stringify(kvItems));
          
          // Look for screenshot keys
          const screenshotKeys = Object.keys(kvItems).filter(key => 
            key.startsWith('screenshot_') || key.includes('screenshot')
          );
          
          if (screenshotKeys.length > 0) {
            const screenshotKey = screenshotKeys[0];
            const directUrl = `https://api.apify.com/v2/key-value-stores/${keyValueStoreId}/records/${screenshotKey}?token=${apiKey}`;
            console.log(`Found potential screenshot in key-value store: ${directUrl}`);
            
            // Fetch this directly
            const imageResponse = await fetch(directUrl);
            if (imageResponse.ok) {
              return await imageResponse.arrayBuffer();
            }
          }
        }
      }
      
      throw new Error("No screenshot URL found in the dataset items");
    }
    
    console.log("Screenshot URL from Apify:", screenshotUrl);
    
    // Fetch the actual screenshot image from the URL
    let imageResponse;
    try {
      imageResponse = await fetch(screenshotUrl);
    } catch (error) {
      console.error("Network error fetching screenshot image:", error);
      throw new Error(`Network error fetching screenshot image: ${error.message}`);
    }
    
    if (!imageResponse.ok) {
      console.error("Error fetching screenshot image:", imageResponse.status, imageResponse.statusText);
      throw new Error(`Error fetching screenshot image: ${imageResponse.status}`);
    }
    
    try {
      console.log("Screenshot image fetched successfully");
      return await imageResponse.arrayBuffer();
    } catch (error) {
      console.error("Error reading image data:", error);
      throw new Error(`Error reading image data: ${error.message}`);
    }
  } catch (err) {
    console.error("Error taking screenshot via Apify API:", err);
    return null;
  }
}
