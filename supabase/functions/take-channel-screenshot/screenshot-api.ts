
import { APIFY_API_TOKEN } from "../_shared/screenshot-utils.ts";

/**
 * Takes a screenshot of a YouTube channel page using Apify's API
 */
export async function takeScreenshotViaAPI(url: string): Promise<{ 
  buffer: ArrayBuffer | null; 
  directUrl: string | null;
  error?: string;
}> {
  try {
    console.log(`Taking screenshot of URL: ${url}`);
    
    // Validate APIFY_API_TOKEN
    if (!APIFY_API_TOKEN) {
      console.error("APIFY_API_TOKEN is not defined");
      return { 
        buffer: null, 
        directUrl: null, 
        error: "Missing API token for screenshot service" 
      };
    }
    
    // Step 1: Start the Apify task to take a screenshot
    console.log("Starting Apify screenshot task...");
    const startResponse = await fetch("https://api.apify.com/v2/actor-tasks/xPTZ2w3ZjmfnmHE8R/run-sync?token=" + APIFY_API_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startUrls: [{ url }],
        waitForSelectorOnLoad: "body",
        fullPage: false,
        hideScrollbar: true,
        waitForMillis: 5000,
      }),
    });
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error("Error starting Apify task:", errorText);
      return { 
        buffer: null, 
        directUrl: null, 
        error: `Failed to start Apify task: ${startResponse.status} ${startResponse.statusText}` 
      };
    }
    
    // Step 2: Get the response from Apify
    const responseData = await startResponse.json();
    console.log("Apify task response:", JSON.stringify(responseData));
    
    // Step 3: Extract the screenshot URL from the response
    // First, try the dataset
    let screenshotUrl = null;
    let directUrl = null;

    // Look in the dataset
    if (responseData?.defaultDatasetId) {
      console.log("Looking for screenshot in dataset...");
      const datasetUrl = `https://api.apify.com/v2/datasets/${responseData.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`;
      const datasetResponse = await fetch(datasetUrl);
      if (datasetResponse.ok) {
        const datasetItems = await datasetResponse.json();
        console.log("Dataset items:", JSON.stringify(datasetItems));
        
        if (datasetItems && datasetItems.length > 0) {
          // Try to find the screenshotUrl property
          for (const item of datasetItems) {
            if (item.screenshotUrl) {
              screenshotUrl = item.screenshotUrl;
              directUrl = item.screenshotUrl;
              console.log("Found screenshot URL in dataset:", screenshotUrl);
              break;
            }
          }
        }
      }
    }
    
    // If not found in dataset, check the key-value store
    if (!screenshotUrl && responseData?.defaultKeyValueStoreId) {
      console.log("Looking for screenshot in key-value store...");
      
      // Try to list keys in the store to find screenshots
      const listKeysUrl = `https://api.apify.com/v2/key-value-stores/${responseData.defaultKeyValueStoreId}/keys?token=${APIFY_API_TOKEN}`;
      const keysResponse = await fetch(listKeysUrl);
      
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        console.log("Key-value store keys:", JSON.stringify(keysData));
        
        // Find screenshot keys
        const screenshotKeys = keysData.items.filter((item: any) => 
          item.key.startsWith('screenshot_') || item.key.includes('screenshot')
        );
        
        if (screenshotKeys.length > 0) {
          // Use the first screenshot key
          const screenshotKey = screenshotKeys[0].key;
          screenshotUrl = `https://api.apify.com/v2/key-value-stores/${responseData.defaultKeyValueStoreId}/records/${screenshotKey}?disableRedirect=true`;
          directUrl = `https://api.apify.com/v2/key-value-stores/${responseData.defaultKeyValueStoreId}/records/${screenshotKey}?disableRedirect=true`;
          console.log("Found screenshot URL in key-value store:", screenshotUrl);
        }
      }
    }
    
    // Finally check for OUTPUT in the response
    if (!screenshotUrl && responseData?.OUTPUT) {
      if (typeof responseData.OUTPUT === 'object' && responseData.OUTPUT.screenshotUrl) {
        screenshotUrl = responseData.OUTPUT.screenshotUrl;
        directUrl = responseData.OUTPUT.screenshotUrl;
        console.log("Found screenshot URL in OUTPUT:", screenshotUrl);
      }
    }
    
    if (!screenshotUrl) {
      console.error("Could not find screenshot URL in Apify response");
      return { 
        buffer: null, 
        directUrl: null, 
        error: "Screenshot URL not found in Apify response" 
      };
    }
    
    console.log("Found screenshot URL:", screenshotUrl);
    
    // Step 4: Fetch the screenshot image
    console.log("Fetching screenshot image from URL:", screenshotUrl);
    try {
      const imageResponse = await fetch(screenshotUrl);
      
      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("Error fetching screenshot image:", errorText);
        return { 
          buffer: null, 
          directUrl, 
          error: `Failed to fetch screenshot: ${imageResponse.status} ${imageResponse.statusText}` 
        };
      }
      
      // Step 5: Return the image data as ArrayBuffer
      const imageBuffer = await imageResponse.arrayBuffer();
      console.log(`Screenshot fetched, size: ${imageBuffer.byteLength} bytes`);
      
      return { buffer: imageBuffer, directUrl };
    } catch (fetchError) {
      console.error("Error fetching screenshot:", fetchError);
      // Return the direct URL even if fetching the buffer failed
      return { 
        buffer: null, 
        directUrl, 
        error: `Error downloading screenshot: ${fetchError.message}` 
      };
    }
  } catch (error) {
    console.error("Error in takeScreenshotViaAPI:", error);
    return { 
      buffer: null, 
      directUrl: null, 
      error: `Screenshot service error: ${error.message}` 
    };
  }
}
