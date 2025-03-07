
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
    
    // Use the website-screenshot-crawler actor directly with the run API
    console.log("Starting Apify screenshot actor...");
    const startResponse = await fetch("https://api.apify.com/v2/acts/apify~website-screenshot-crawler/runs?token=" + APIFY_API_TOKEN, {
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
      console.error("Error starting Apify actor:", errorText);
      return { 
        buffer: null, 
        directUrl: null, 
        error: `Failed to start Apify actor: ${startResponse.status} ${startResponse.statusText}` 
      };
    }
    
    // Get the response from Apify
    const responseData = await startResponse.json();
    console.log("Apify actor response:", JSON.stringify(responseData));
    
    // Extract the screenshot URL from the response
    // First, try the dataset
    let screenshotUrl = null;
    let directUrl = null;

    // Get the run ID to check the status
    const runId = responseData?.data?.id;
    if (!runId) {
      console.error("No run ID found in Apify response");
      return { 
        buffer: null, 
        directUrl: null, 
        error: "No run ID found in Apify response" 
      };
    }
    
    console.log(`Apify run started with ID: ${runId}`);
    
    // Poll for the run to complete
    let status = "READY";
    let attempts = 0;
    const maxAttempts = 45; // Allow up to 1.5 minutes (2 seconds between checks)
    
    while (status !== "SUCCEEDED" && status !== "FAILED" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;
      
      console.log(`Checking run status (attempt ${attempts}/${maxAttempts})...`);
      
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
      if (!statusResponse.ok) {
        console.error(`Error checking run status: ${statusResponse.status}`);
        continue;
      }
      
      const statusData = await statusResponse.json();
      status = statusData?.data?.status;
      
      console.log(`Run status: ${status}`);
      
      if (status === "FAILED") {
        return { 
          buffer: null, 
          directUrl: null, 
          error: "Apify run failed" 
        };
      }
    }
    
    if (status !== "SUCCEEDED") {
      return { 
        buffer: null, 
        directUrl: null, 
        error: "Timeout waiting for Apify run to complete" 
      };
    }
    
    // If the run succeeded, get the output
    const defaultKeyValueStoreId = responseData?.data?.defaultKeyValueStoreId;
    
    if (defaultKeyValueStoreId) {
      // Check the key-value store for the screenshot
      const keysResponse = await fetch(`https://api.apify.com/v2/key-value-stores/${defaultKeyValueStoreId}/keys?token=${APIFY_API_TOKEN}`);
      
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        console.log("Key-value store keys:", JSON.stringify(keysData));
        
        // Find screenshot keys
        const screenshotKeys = keysData.data.items.filter((item: any) => 
          item.key.includes('screenshot_')
        );
        
        if (screenshotKeys.length > 0) {
          // Use the first screenshot key
          const screenshotKey = screenshotKeys[0].key;
          directUrl = `https://api.apify.com/v2/key-value-stores/${defaultKeyValueStoreId}/records/${screenshotKey}?disableRedirect=true`;
          screenshotUrl = directUrl;
          console.log("Found screenshot URL in key-value store:", screenshotUrl);
        }
      }
    }
    
    // If we didn't find the screenshot in the key-value store, try the dataset
    if (!screenshotUrl) {
      const defaultDatasetId = responseData?.data?.defaultDatasetId;
      
      if (defaultDatasetId) {
        console.log("Looking for screenshot in dataset...");
        const datasetUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${APIFY_API_TOKEN}`;
        const datasetResponse = await fetch(datasetUrl);
        
        if (datasetResponse.ok) {
          const datasetItems = await datasetResponse.json();
          console.log("Dataset items:", JSON.stringify(datasetItems));
          
          if (datasetItems?.data?.length > 0) {
            // Try to find the screenshotUrl property
            for (const item of datasetItems.data) {
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
    
    // Try to fetch the screenshot image
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
      
      // Return the image data as ArrayBuffer
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
