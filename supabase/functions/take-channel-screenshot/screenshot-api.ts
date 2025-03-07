
import { APIFY_API_TOKEN } from "../_shared/screenshot-utils.ts";
import { validateApiToken, APIFY_BASE_URL } from "./api/config.ts";
import { startActorRun, pollForRunCompletion } from "./api/run-manager.ts";
import { 
  extractScreenshotFromKeyValueStore, 
  extractScreenshotFromDataset,
  fetchScreenshotImage
} from "./api/screenshot-extractor.ts";
import { ScreenshotResult } from "./api/types.ts";

/**
 * Takes a screenshot of a YouTube channel page using Apify's API
 */
export async function takeScreenshotViaAPI(url: string): Promise<ScreenshotResult> {
  try {
    console.log(`Taking screenshot of URL: ${url}`);
    
    // Validate APIFY_API_TOKEN
    const tokenValidation = validateApiToken();
    if (!tokenValidation.isValid) {
      return { 
        buffer: null, 
        directUrl: null, 
        error: tokenValidation.error 
      };
    }
    
    // Start the Apify actor run
    const runResult = await startActorRun(url);
    if (!runResult.success) {
      return { 
        buffer: null, 
        directUrl: null, 
        error: runResult.error 
      };
    }
    
    // Poll for the run to complete
    const pollResult = await pollForRunCompletion(runResult.runId!);
    if (!pollResult.success) {
      return { 
        buffer: null, 
        directUrl: null, 
        error: pollResult.error 
      };
    }
    
    // Get the run data to extract screenshot URLs
    console.log(`Fetching run data for ID: ${runResult.runId}`);
    const runDataResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runResult.runId}?token=${APIFY_API_TOKEN}`);
    if (!runDataResponse.ok) {
      console.error(`Failed to get run data: ${runDataResponse.status}`);
      return {
        buffer: null,
        directUrl: null,
        error: `Failed to get Apify run data: ${runDataResponse.status}`
      };
    }
    
    const { data } = await runDataResponse.json();
    console.log("Got run data:", JSON.stringify(data));
    
    // Try to extract the screenshot URL from key-value store
    let screenshotUrl = null;
    let directUrl = null;
    
    if (data?.defaultKeyValueStoreId) {
      console.log("Checking key-value store for screenshot URL");
      const kvResult = await extractScreenshotFromKeyValueStore(data.defaultKeyValueStoreId);
      screenshotUrl = kvResult.screenshotUrl;
      directUrl = kvResult.directUrl;
    }
    
    // If we didn't find the screenshot in the key-value store, try the dataset
    if (!screenshotUrl && data?.defaultDatasetId) {
      console.log("Checking dataset for screenshot URL");
      const dsResult = await extractScreenshotFromDataset(data.defaultDatasetId);
      screenshotUrl = dsResult.screenshotUrl;
      directUrl = dsResult.directUrl;
    }
    
    // If we still don't have a URL, log detailed information to help debug
    if (!screenshotUrl && !directUrl) {
      console.error("Could not find screenshot URL in standard Apify response locations");
      console.log("Full run data:", JSON.stringify(data));
      
      // As a last resort, try accessing OUTPUT directly without parsing
      try {
        if (data?.defaultKeyValueStoreId) {
          const outputUrl = `${APIFY_BASE_URL}/key-value-stores/${data.defaultKeyValueStoreId}/records/OUTPUT?token=${APIFY_API_TOKEN}`;
          console.log("Trying direct access to OUTPUT:", outputUrl);
          
          const outputResponse = await fetch(outputUrl, { method: 'HEAD' });
          if (outputResponse.ok) {
            const contentType = outputResponse.headers.get('content-type');
            console.log(`Direct OUTPUT content type: ${contentType}`);
            
            if (contentType && contentType.startsWith('image/')) {
              // OUTPUT is directly an image
              directUrl = outputUrl;
              screenshotUrl = outputUrl;
              console.log("OUTPUT is directly an image, using as screenshot URL");
            }
          }
        }
      } catch (e) {
        console.error("Error in last resort OUTPUT check:", e);
      }
      
      if (!screenshotUrl && !directUrl) {
        console.error("All screenshot extraction methods failed");
        return { 
          buffer: null, 
          directUrl: null, 
          error: "Screenshot URL not found in Apify response. Please try a different URL format or try again later." 
        };
      }
    }
    
    console.log("Found screenshot URL:", screenshotUrl);
    
    // Try to fetch the screenshot image
    if (screenshotUrl) {
      const fetchResult = await fetchScreenshotImage(screenshotUrl);
      
      // Return the direct URL even if fetching the buffer failed
      if (!fetchResult.buffer) {
        return { 
          buffer: null, 
          directUrl, 
          error: fetchResult.error 
        };
      }
      
      return { buffer: fetchResult.buffer, directUrl };
    } else if (directUrl) {
      // We have a direct URL but couldn't fetch the buffer
      return { 
        buffer: null, 
        directUrl, 
        error: "Unable to fetch screenshot buffer, but direct URL is available" 
      };
    }
    
    return { 
      buffer: null, 
      directUrl: null, 
      error: "Unknown error extracting screenshot" 
    };
  } catch (error) {
    console.error("Error in takeScreenshotViaAPI:", error);
    return { 
      buffer: null, 
      directUrl: null, 
      error: `Screenshot service error: ${error.message}` 
    };
  }
}
