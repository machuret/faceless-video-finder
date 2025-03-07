
import { APIFY_API_TOKEN } from "../_shared/screenshot-utils.ts";

/**
 * Takes a screenshot of a YouTube channel page using Apify's API
 */
export async function takeScreenshotViaAPI(url: string): Promise<ArrayBuffer | null> {
  try {
    console.log(`Taking screenshot of URL: ${url}`);
    
    // Validate APIFY_API_TOKEN
    if (!APIFY_API_TOKEN) {
      console.error("APIFY_API_TOKEN is not defined");
      throw new Error("Missing API token for screenshot service");
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
      throw new Error(`Failed to start Apify task: ${startResponse.status} ${startResponse.statusText}`);
    }
    
    // Step 2: Get the response from Apify
    const responseData = await startResponse.json();
    console.log("Apify task response:", JSON.stringify(responseData));
    
    // Step 3: Extract the screenshot URL from the response
    // First, try the outputItems.items in the response
    let screenshotUrl = null;

    // Look in the default location
    if (responseData?.defaultKeyValueStoreId && responseData?.id) {
      console.log("Looking for screenshot in default location...");
      const sanitizedUrlForKey = url.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      const potentialKey = `screenshot_${sanitizedUrlForKey}_${responseData.id}`;
      screenshotUrl = `https://api.apify.com/v2/key-value-stores/${responseData.defaultKeyValueStoreId}/records/${potentialKey}?disableRedirect=true`;
    }
    
    // Also check if there are any output items that contain a screenshotUrl
    if (!screenshotUrl && responseData?.outputItems?.items?.length > 0) {
      console.log("Looking for screenshot in output items...");
      const item = responseData.outputItems.items.find((item: any) => item.screenshotUrl);
      if (item?.screenshotUrl) {
        screenshotUrl = item.screenshotUrl;
      }
    }
    
    // Try to find screenshot in the dataset
    if (!screenshotUrl && responseData?.defaultDatasetId) {
      console.log("Looking for screenshot in dataset...");
      const datasetUrl = `https://api.apify.com/v2/datasets/${responseData.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`;
      const datasetResponse = await fetch(datasetUrl);
      if (datasetResponse.ok) {
        const datasetItems = await datasetResponse.json();
        if (datasetItems.length > 0 && datasetItems[0].screenshotUrl) {
          screenshotUrl = datasetItems[0].screenshotUrl;
        }
      }
    }
    
    if (!screenshotUrl) {
      console.error("Could not find screenshot URL in Apify response");
      throw new Error("Screenshot URL not found in Apify response");
    }
    
    console.log("Found screenshot URL:", screenshotUrl);
    
    // Step 4: Fetch the screenshot image
    console.log("Fetching screenshot image from URL:", screenshotUrl);
    const imageResponse = await fetch(screenshotUrl);
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Error fetching screenshot image:", errorText);
      throw new Error(`Failed to fetch screenshot: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    // Step 5: Return the image data as ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log(`Screenshot fetched, size: ${imageBuffer.byteLength} bytes`);
    
    return imageBuffer;
  } catch (error) {
    console.error("Error in takeScreenshotViaAPI:", error);
    return null;
  }
}
