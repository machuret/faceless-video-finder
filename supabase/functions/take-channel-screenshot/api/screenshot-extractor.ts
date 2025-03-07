
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
    
    // First check for the OUTPUT key specifically (based on user's provided format)
    try {
      console.log("First checking OUTPUT key directly based on documented Apify format");
      const outputResponse = await fetch(`${APIFY_BASE_URL}/key-value-stores/${storeId}/records/OUTPUT?token=${APIFY_API_TOKEN}`);
      
      if (outputResponse.ok) {
        // Try to parse as JSON array as shown in the example output
        const outputData = await outputResponse.json();
        console.log("OUTPUT data:", JSON.stringify(outputData));
        
        // Handle array format from example
        if (Array.isArray(outputData)) {
          for (const item of outputData) {
            if (item.screenshotUrl) {
              console.log("Found screenshot URL in OUTPUT array:", item.screenshotUrl);
              return { screenshotUrl: item.screenshotUrl, directUrl: item.screenshotUrl };
            }
          }
        } 
        // Handle object format
        else if (outputData.screenshotUrl) {
          console.log("Found screenshot URL in OUTPUT object:", outputData.screenshotUrl);
          return { screenshotUrl: outputData.screenshotUrl, directUrl: outputData.screenshotUrl };
        }
      }
    } catch (outputError) {
      console.log("Error checking OUTPUT key:", outputError);
      // Continue with other methods
    }
    
    // Check for screenshot_* keys based on the example URL pattern
    const screenshotPattern = /screenshot_.*[a-f0-9]+$/i;
    console.log("Checking for keys matching screenshot pattern:", screenshotPattern);
    
    for (const item of keysData.data.items) {
      if (screenshotPattern.test(item.key)) {
        console.log("Found key matching screenshot pattern:", item.key);
        const url = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/${item.key}?disableRedirect=true`;
        
        try {
          // Verify it's an actual image
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            console.log("Verified screenshot URL is valid:", url);
            return { screenshotUrl: url, directUrl: url };
          }
        } catch (e) {
          console.log("Error verifying screenshot URL:", e);
        }
      }
    }
    
    // Find screenshot keys with improved matching that will catch various patterns
    const screenshotKeys = keysData.data.items.filter(item => 
      item.key.toLowerCase().includes('screenshot') || 
      item.key.toLowerCase().includes('output') ||
      item.key.toLowerCase().includes('image') ||
      item.key.match(/\.(png|jpg|jpeg|webp)$/i) ||
      item.key === 'OUTPUT'
    );
    
    console.log(`Found ${screenshotKeys.length} potential screenshot keys:`, JSON.stringify(screenshotKeys));
    
    if (screenshotKeys.length > 0) {
      // Try all potential keys in order until we find a valid image
      for (const keyItem of screenshotKeys) {
        const screenshotKey = keyItem.key;
        const url = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/${screenshotKey}?disableRedirect=true`;
        
        try {
          // Check if this key actually contains image data
          const testResponse = await fetch(url, { method: 'HEAD' });
          const contentType = testResponse.headers.get('content-type');
          
          if (testResponse.ok && contentType && contentType.startsWith('image/')) {
            console.log(`Found valid image at key ${screenshotKey} with content type ${contentType}`);
            return { screenshotUrl: url, directUrl: url };
          } else {
            console.log(`Key ${screenshotKey} is not a valid image (status: ${testResponse.status}, type: ${contentType})`);
          }
        } catch (keyError) {
          console.log(`Error checking key ${screenshotKey}:`, keyError);
          // Continue to next key
        }
      }
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
        // Check for screenshot URL in various formats
        if (item.screenshotUrl) {
          console.log("Found direct screenshot URL in dataset item:", item.screenshotUrl);
          return { screenshotUrl: item.screenshotUrl, directUrl: item.screenshotUrl };
        } else if (item.screenshot) {
          console.log("Found screenshot property in dataset item:", item.screenshot);
          return { screenshotUrl: item.screenshot, directUrl: item.screenshot };
        } else if (item.imageUrl) {
          console.log("Found imageUrl in dataset item:", item.imageUrl);
          return { screenshotUrl: item.imageUrl, directUrl: item.imageUrl };
        } else if (item.url && typeof item.url === 'string' && 
                  (item.url.includes('screenshot') || item.url.match(/\.(png|jpg|jpeg|webp)$/i))) {
          console.log("Found URL that appears to be a screenshot:", item.url);
          return { screenshotUrl: item.url, directUrl: item.url };
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
    
    // Check if we actually got an image
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`Received non-image content type: ${contentType}`);
      try {
        // Try to parse as JSON to see if it contains a URL
        const data = await imageResponse.json();
        console.log("Response data (expected image but got JSON):", JSON.stringify(data));
        
        if (data.url && typeof data.url === 'string' && 
           (data.url.startsWith('http://') || data.url.startsWith('https://'))) {
          // If we got JSON with a URL, try to fetch that URL instead
          console.log("Found URL in JSON response, trying to fetch that instead:", data.url);
          return fetchScreenshotImage(data.url);
        }
      } catch (e) {
        // Not JSON, just log the first part of the response
        const text = await imageResponse.text();
        console.error("Non-image response content:", text.substring(0, 500));
      }
      
      return { 
        buffer: null, 
        error: `Received non-image content type: ${contentType}` 
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
