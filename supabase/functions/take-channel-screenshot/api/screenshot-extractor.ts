
import { APIFY_BASE_URL, APIFY_API_TOKEN } from "./config.ts";
import { ApifyKeyValueStoreResponse } from "./types.ts";

/**
 * Extracts screenshot URL from key-value store
 */
export async function extractScreenshotFromKeyValueStore(storeId: string): Promise<{ 
  screenshotUrl: string | null; 
  directUrl: string | null;
}> {
  try {
    console.log(`Checking key-value store ${storeId} for screenshot`);
    
    const keysResponse = await fetch(`${APIFY_BASE_URL}/key-value-stores/${storeId}/keys?token=${APIFY_API_TOKEN}`);
    
    if (!keysResponse.ok) {
      console.error(`Error fetching store keys: ${keysResponse.status}`);
      return { screenshotUrl: null, directUrl: null };
    }
    
    const keysData = await keysResponse.json() as ApifyKeyValueStoreResponse;
    console.log("Key-value store keys:", JSON.stringify(keysData));
    
    // Find screenshot keys (improved to match pattern in the successful response)
    const screenshotKeys = keysData.data.items.filter(item => 
      item.key.startsWith('screenshot_')
    );
    
    if (screenshotKeys.length > 0) {
      // Use the first screenshot key
      const screenshotKey = screenshotKeys[0].key;
      const url = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/${screenshotKey}?disableRedirect=true`;
      console.log("Found screenshot URL in key-value store:", url);
      return { screenshotUrl: url, directUrl: url };
    }
    
    return { screenshotUrl: null, directUrl: null };
  } catch (error) {
    console.error("Error extracting screenshot from key-value store:", error);
    return { screenshotUrl: null, directUrl: null };
  }
}

/**
 * Extracts screenshot URL from dataset
 */
export async function extractScreenshotFromDataset(datasetId: string): Promise<{ 
  screenshotUrl: string | null; 
  directUrl: string | null;
}> {
  try {
    console.log(`Checking dataset ${datasetId} for screenshot`);
    
    const datasetUrl = `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`;
    const datasetResponse = await fetch(datasetUrl);
    
    if (!datasetResponse.ok) {
      console.error(`Error fetching dataset items: ${datasetResponse.status}`);
      return { screenshotUrl: null, directUrl: null };
    }
    
    const datasetItems = await datasetResponse.json();
    console.log("Dataset items:", JSON.stringify(datasetItems));
    
    if (datasetItems?.data?.length > 0) {
      // Try to find the screenshotUrl property
      for (const item of datasetItems.data) {
        if (item.screenshotUrl) {
          console.log("Found screenshot URL in dataset:", item.screenshotUrl);
          return { screenshotUrl: item.screenshotUrl, directUrl: item.screenshotUrl };
        }
      }
    }
    
    return { screenshotUrl: null, directUrl: null };
  } catch (error) {
    console.error("Error extracting screenshot from dataset:", error);
    return { screenshotUrl: null, directUrl: null };
  }
}

/**
 * Fetches the screenshot image
 */
export async function fetchScreenshotImage(screenshotUrl: string): Promise<{ 
  buffer: ArrayBuffer | null; 
  error?: string;
}> {
  try {
    console.log("Fetching screenshot image from URL:", screenshotUrl);
    
    const imageResponse = await fetch(screenshotUrl);
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Error fetching screenshot image:", errorText);
      return { 
        buffer: null, 
        error: `Failed to fetch screenshot: ${imageResponse.status} ${imageResponse.statusText}` 
      };
    }
    
    // Return the image data as ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer();
    console.log(`Screenshot fetched, size: ${imageBuffer.byteLength} bytes`);
    
    return { buffer: imageBuffer };
  } catch (fetchError) {
    console.error("Error fetching screenshot:", fetchError);
    return { 
      buffer: null, 
      error: `Error downloading screenshot: ${fetchError.message}` 
    };
  }
}
