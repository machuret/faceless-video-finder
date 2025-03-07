
import { APIFY_BASE_URL, APIFY_API_TOKEN } from "./config.ts";
import { ApifyKeyValueStoreResponse, ApifyDatasetItemResponse } from "./types.ts";

/**
 * Extracts screenshot URL from key-value store
 */
export async function extractScreenshotFromKeyValueStore(storeId: string): Promise<{ 
  screenshotUrl: string | null; 
  directUrl: string | null;
}> {
  try {
    console.log(`Checking key-value store ${storeId} for screenshot`);
    
    // First, log the full dataset content to debug
    console.log(`Fetching store content from: ${APIFY_BASE_URL}/key-value-stores/${storeId}/keys?token=${APIFY_API_TOKEN}`);
    
    const keysResponse = await fetch(`${APIFY_BASE_URL}/key-value-stores/${storeId}/keys?token=${APIFY_API_TOKEN}`);
    
    if (!keysResponse.ok) {
      console.error(`Error fetching store keys: ${keysResponse.status} - ${await keysResponse.text()}`);
      return { screenshotUrl: null, directUrl: null };
    }
    
    const keysData = await keysResponse.json() as ApifyKeyValueStoreResponse;
    console.log("Key-value store keys:", JSON.stringify(keysData));
    
    // Find screenshot keys with improved matching that will catch both patterns:
    // "screenshot_" prefix or keys containing "screenshot"
    const screenshotKeys = keysData.data.items.filter(item => 
      item.key.startsWith('screenshot_') || 
      item.key.includes('screenshot')
    );
    
    console.log(`Found ${screenshotKeys.length} potential screenshot keys:`, JSON.stringify(screenshotKeys));
    
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
    
    // Enhanced logging for debugging
    console.log(`Fetching dataset from: ${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`);
    
    const datasetUrl = `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}`;
    const datasetResponse = await fetch(datasetUrl);
    
    if (!datasetResponse.ok) {
      console.error(`Error fetching dataset items: ${datasetResponse.status} - ${await datasetResponse.text()}`);
      return { screenshotUrl: null, directUrl: null };
    }
    
    const datasetItems = await datasetResponse.json() as ApifyDatasetItemResponse;
    console.log("Dataset items:", JSON.stringify(datasetItems));
    
    // Check for any items in the dataset
    if (datasetItems?.data && Array.isArray(datasetItems.data) && datasetItems.data.length > 0) {
      // First try to find an item with the specific screenshotUrl property
      for (const item of datasetItems.data) {
        if (item.screenshotUrl) {
          console.log("Found direct screenshot URL in dataset item:", item.screenshotUrl);
          return { screenshotUrl: item.screenshotUrl, directUrl: item.screenshotUrl };
        }
      }
      
      // If no specific screenshotUrl property, look through all properties for any URL-like value
      // that might contain screenshot information
      for (const item of datasetItems.data) {
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === 'string' && 
              (value.includes('screenshot') || key.includes('screenshot')) && 
              (value.startsWith('http://') || value.startsWith('https://'))) {
            console.log(`Found potential screenshot URL in dataset item property ${key}:`, value);
            return { screenshotUrl: value, directUrl: value };
          }
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
