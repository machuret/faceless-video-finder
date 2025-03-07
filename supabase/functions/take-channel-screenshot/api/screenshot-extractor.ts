
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
    
    // First try the OUTPUT key directly - this is the primary location according to Apify docs
    try {
      console.log("Checking OUTPUT key for screenshot data");
      const outputUrl = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/OUTPUT?token=${APIFY_API_TOKEN}`;
      console.log("Fetching OUTPUT from:", outputUrl);
      
      const outputResponse = await fetch(outputUrl);
      
      if (outputResponse.ok) {
        const contentType = outputResponse.headers.get('content-type');
        console.log(`OUTPUT response content type: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const outputData = await outputResponse.json();
            console.log("OUTPUT data found:", JSON.stringify(outputData));
            
            // For Ultimate Screenshot Actor: Output might be an array of objects
            // with urls and screenshots
            if (Array.isArray(outputData) && outputData.length > 0) {
              for (const item of outputData) {
                // Check for typical screenshot URL fields
                if (item.screenshotUrl || item.screenshot || item.imageUrl) {
                  const url = item.screenshotUrl || item.screenshot || item.imageUrl;
                  console.log("Found screenshot URL in OUTPUT array:", url);
                  return { screenshotUrl: url, directUrl: url };
                }
                
                // Some actors might include the actual URL under a "url" field
                // with a corresponding "resultUrl" or similar for the screenshot
                if (item.url && (item.resultUrl || item.resultScreenshotUrl)) {
                  const url = item.resultUrl || item.resultScreenshotUrl;
                  console.log("Found result URL in OUTPUT array:", url);
                  return { screenshotUrl: url, directUrl: url };
                }
              }
            }
            // Some actors output a direct object with the URL
            else if (outputData && typeof outputData === 'object') {
              // Check for common screenshot URL fields
              for (const field of ['screenshotUrl', 'screenshot', 'imageUrl', 'resultUrl', 'url']) {
                if (outputData[field] && typeof outputData[field] === 'string') {
                  console.log(`Found ${field} in OUTPUT:`, outputData[field]);
                  return { 
                    screenshotUrl: outputData[field], 
                    directUrl: outputData[field] 
                  };
                }
              }
              
              // Some actors nest the result
              if (outputData.result && typeof outputData.result === 'object') {
                for (const field of ['screenshotUrl', 'screenshot', 'imageUrl', 'resultUrl', 'url']) {
                  if (outputData.result[field] && typeof outputData.result[field] === 'string') {
                    console.log(`Found ${field} in OUTPUT.result:`, outputData.result[field]);
                    return { 
                      screenshotUrl: outputData.result[field], 
                      directUrl: outputData.result[field] 
                    };
                  }
                }
              }
            }
          } catch (e) {
            console.log("Error parsing OUTPUT as JSON:", e);
          }
        }
        // If OUTPUT is directly an image
        else if (contentType && contentType.startsWith('image/')) {
          console.log("OUTPUT key contains the image directly");
          const url = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/OUTPUT?token=${APIFY_API_TOKEN}`;
          return { screenshotUrl: url, directUrl: url };
        }
      }
    } catch (outputError) {
      console.log("Error checking OUTPUT key:", outputError);
    }
    
    // If OUTPUT didn't work, fetch all keys and check for screenshot patterns
    console.log(`Fetching all store keys from: ${APIFY_BASE_URL}/key-value-stores/${storeId}/keys?token=${APIFY_API_TOKEN}`);
    
    const keysResponse = await fetch(`${APIFY_BASE_URL}/key-value-stores/${storeId}/keys?token=${APIFY_API_TOKEN}`);
    
    if (!keysResponse.ok) {
      console.error(`Error fetching store keys: ${keysResponse.status} - ${await keysResponse.text()}`);
      return { screenshotUrl: null, directUrl: null };
    }
    
    const keysData = await keysResponse.json() as ApifyKeyValueStoreResponse;
    console.log("Key-value store keys:", JSON.stringify(keysData));
    
    // Look for specific key patterns that might contain the screenshot
    const possibleScreenshotKeys = [
      'screenshot', 
      'image',
      'result',
      'output',
      '.jpg',
      '.jpeg',
      '.png'
    ];
    
    for (const item of keysData.data.items) {
      const key = item.key.toLowerCase();
      
      if (possibleScreenshotKeys.some(pattern => key.includes(pattern))) {
        console.log("Found potential screenshot key:", item.key);
        const url = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/${item.key}?token=${APIFY_API_TOKEN}`;
        
        try {
          // Verify it's an image
          const response = await fetch(url, { method: 'HEAD' });
          const contentType = response.headers.get('content-type');
          
          if (response.ok && contentType && contentType.startsWith('image/')) {
            console.log(`Verified screenshot URL is valid: ${url} (${contentType})`);
            return { screenshotUrl: url, directUrl: url };
          } else {
            console.log(`Key ${item.key} exists but is not a valid image (${contentType})`);
          }
        } catch (e) {
          console.log("Error verifying screenshot URL:", e);
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
    if (datasetItems?.data && Array.isArray(datasetItems.data)) {
      // First try to find items with the specific URL fields
      for (const item of datasetItems.data) {
        // Check for common screenshot URL fields
        for (const field of ['screenshotUrl', 'screenshot', 'imageUrl', 'resultUrl']) {
          if (item[field] && typeof item[field] === 'string') {
            console.log(`Found ${field} in dataset item:`, item[field]);
            return { screenshotUrl: item[field], directUrl: item[field] };
          }
        }
        
        // Some output might have URL field with direct image link
        if (item.url && typeof item.url === 'string' && 
           (item.url.match(/\.(?:png|jpg|jpeg|webp|gif)$/i) || 
            item.url.includes('screenshot') || 
            item.url.includes('image'))) {
          console.log("Found URL that appears to be a screenshot:", item.url);
          return { screenshotUrl: item.url, directUrl: item.url };
        }
        
        // Some actors might nest results
        if (item.result && typeof item.result === 'object') {
          for (const field of ['screenshotUrl', 'screenshot', 'imageUrl', 'resultUrl']) {
            if (item.result[field] && typeof item.result[field] === 'string') {
              console.log(`Found ${field} in dataset item.result:`, item.result[field]);
              return { screenshotUrl: item.result[field], directUrl: item.result[field] };
            }
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
    
    // Check if we actually got an image
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`Received non-image content type: ${contentType}`);
      try {
        // Try to parse as JSON to see if it contains a URL
        const data = await imageResponse.json();
        console.log("Response data (expected image but got JSON):", JSON.stringify(data));
        
        // Check various common fields for URLs
        for (const field of ['url', 'screenshotUrl', 'screenshot', 'imageUrl', 'resultUrl']) {
          if (data[field] && typeof data[field] === 'string' && 
             (data[field].startsWith('http://') || data[field].startsWith('https://'))) {
            console.log(`Found ${field} in JSON response, trying to fetch that instead:`, data[field]);
            return fetchScreenshotImage(data[field]);
          }
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
