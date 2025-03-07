
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
      const kvResult = await extractScreenshotFromKeyValueStore(data.defaultKeyValueStoreId);
      screenshotUrl = kvResult.screenshotUrl;
      directUrl = kvResult.directUrl;
    }
    
    // If we didn't find the screenshot in the key-value store, try the dataset
    if (!screenshotUrl && data?.defaultDatasetId) {
      const dsResult = await extractScreenshotFromDataset(data.defaultDatasetId);
      screenshotUrl = dsResult.screenshotUrl;
      directUrl = dsResult.directUrl;
    }
    
    // If we still don't have a URL, try checking for other output locations
    if (!screenshotUrl && !directUrl) {
      console.error("Could not find screenshot URL in standard Apify response locations");
      
      // Check the run logs to see if there's a screenshot URL mentioned
      const logsResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runResult.runId}/log?token=${APIFY_API_TOKEN}`);
      if (logsResponse.ok) {
        const logsText = await logsResponse.text();
        console.log("Run logs:", logsText);
        
        // Try to extract screenshot URL from logs using regex
        const urlMatch = logsText.match(/https:\/\/api\.apify\.com\/v2\/key-value-stores\/[^/]+\/records\/screenshot[^"'\s]+/i);
        if (urlMatch) {
          screenshotUrl = urlMatch[0];
          directUrl = urlMatch[0];
          console.log("Found screenshot URL in logs:", screenshotUrl);
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
  } catch (error) {
    console.error("Error in takeScreenshotViaAPI:", error);
    return { 
      buffer: null, 
      directUrl: null, 
      error: `Screenshot service error: ${error.message}` 
    };
  }
}
