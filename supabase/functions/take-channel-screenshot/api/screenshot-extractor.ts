
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
            
            // Handle the specific format of the Apify OUTPUT that includes an array of objects
            // with a screenshotUrl property, as shown in the example:
            // [{ "url": "https://www.youtube.com/@1MillionTests", "screenshotUrl": "https://api.apify.com/..." }]
            if (Array.isArray(outputData) && outputData.length > 0) {
              for (const item of outputData) {
                if (item.screenshotUrl) {
                  console.log("Found screenshotUrl in OUTPUT array item:", item.screenshotUrl);
                  // Clean the URL if it contains disableRedirect parameter
                  const cleanUrl = item.screenshotUrl.includes('?disableRedirect=true') 
                    ? item.screenshotUrl.replace('?disableRedirect=true', '') 
                    : item.screenshotUrl;
                  return { 
                    screenshotUrl: cleanUrl, 
                    directUrl: cleanUrl 
                  };
                }
              }
            }
            // Also try direct object format as fallback
            else if (outputData && typeof outputData === 'object' && outputData.screenshotUrl) {
              console.log("Found screenshotUrl in OUTPUT object:", outputData.screenshotUrl);
              const cleanUrl = outputData.screenshotUrl.includes('?disableRedirect=true') 
                ? outputData.screenshotUrl.replace('?disableRedirect=true', '') 
                : outputData.screenshotUrl;
              return { 
                screenshotUrl: cleanUrl, 
                directUrl: cleanUrl 
              };
            }
          } catch (e) {
            console.log("Error parsing OUTPUT as JSON:", e);
          }
        }
        // Check if OUTPUT is directly an image
        else if (contentType && contentType.startsWith('image/')) {
          console.log("OUTPUT key contains an image directly");
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
    
    // Look specifically for the screenshot key format shown in the example
    // "screenshot_https___www_youtube_com__1milliontests_10dedf34a445edc1f5f77248eb636986"
    
    // Check for keys matching screenshot pattern based on the URL from the console
    const screenshotPatterns = [
      /^screenshot_.*$/i,
      /^screenshot.*\.(?:png|jpg|jpeg|webp)$/i,
      /^.*_screenshot.*$/i
    ];
    
    for (const pattern of screenshotPatterns) {
      console.log(`Checking for keys matching pattern: ${pattern}`);
      
      for (const item of keysData.data.items) {
        if (pattern.test(item.key)) {
          console.log("Found key matching screenshot pattern:", item.key);
          const url = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/${item.key}?token=${APIFY_API_TOKEN}`;
          
          try {
            // Verify it's an actual image
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
    }
    
    // If we still haven't found anything, look for any image files
    for (const item of keysData.data.items) {
      const key = item.key;
      if (/\.(png|jpg|jpeg|webp)$/i.test(key) || 
          key.toLowerCase().includes('image') || 
          key.toLowerCase().includes('screenshot')) {
        
        console.log("Found potential image key:", key);
        const url = `${APIFY_BASE_URL}/key-value-stores/${storeId}/records/${key}?token=${APIFY_API_TOKEN}`;
        
        try {
          const response = await fetch(url, { method: 'HEAD' });
          const contentType = response.headers.get('content-type');
          
          if (response.ok && contentType && contentType.startsWith('image/')) {
            console.log(`Found image at key ${key} with content type ${contentType}`);
            return { screenshotUrl: url, directUrl: url };
          }
        } catch (e) {
          console.log(`Error checking key ${key}:`, e);
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
