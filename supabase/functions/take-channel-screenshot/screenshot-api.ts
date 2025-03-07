
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
    
    // Enhanced multi-source extraction
    // Try multiple sources for screenshots, starting with most likely locations
    let screenshotUrl = null;
    let directUrl = null;
    
    // 1. First check the dataset - for Ultimate Screenshot Actor this is most likely
    if (data?.defaultDatasetId) {
      console.log("Checking dataset for screenshot URL");
      const dsResult = await extractScreenshotFromDataset(data.defaultDatasetId);
      screenshotUrl = dsResult.screenshotUrl;
      directUrl = dsResult.directUrl;
    }
    
    // 2. If not found in dataset, try key-value store
    if (!screenshotUrl && data?.defaultKeyValueStoreId) {
      console.log("Checking key-value store for screenshot URL");
      const kvResult = await extractScreenshotFromKeyValueStore(data.defaultKeyValueStoreId);
      screenshotUrl = kvResult.screenshotUrl;
      directUrl = kvResult.directUrl;
    }
    
    // 3. Special handling for Ultimate Screenshot Actor - it might store the screenshot directly in the output
    if (!screenshotUrl && !directUrl && data?.defaultKeyValueStoreId) {
      // Try direct access to OUTPUT as image
      try {
        const outputUrl = `${APIFY_BASE_URL}/key-value-stores/${data.defaultKeyValueStoreId}/records/OUTPUT?token=${APIFY_API_TOKEN}`;
        console.log("Trying direct access to OUTPUT as image:", outputUrl);
        
        const response = await fetch(outputUrl, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        
        if (response.ok && contentType && contentType.startsWith('image/')) {
          console.log("OUTPUT is directly an image, using as screenshot URL");
          directUrl = outputUrl;
          screenshotUrl = outputUrl;
        }
      } catch (e) {
        console.error("Error checking direct OUTPUT access:", e);
      }
    }
    
    // If we still don't have a URL, try looking in the run log for clues
    if (!screenshotUrl && !directUrl) {
      try {
        console.log("Checking run logs for screenshot URL clues");
        const logsUrl = `${APIFY_BASE_URL}/actor-runs/${runResult.runId}/log?token=${APIFY_API_TOKEN}`;
        const logsResponse = await fetch(logsUrl);
        
        if (logsResponse.ok) {
          const logsText = await logsResponse.text();
          
          // Look for common URL patterns in logs
          const urlMatches = logsText.match(/(https?:\/\/[^\s"']+\.(?:png|jpg|jpeg|webp|gif))/gi);
          if (urlMatches && urlMatches.length > 0) {
            console.log("Found potential image URL in logs:", urlMatches[0]);
            screenshotUrl = urlMatches[0];
            directUrl = urlMatches[0];
          }
        }
      } catch (e) {
        console.error("Error checking run logs:", e);
      }
    }
    
    if (!screenshotUrl && !directUrl) {
      console.error("All screenshot extraction methods failed");
      return { 
        buffer: null, 
        directUrl: null, 
        error: "Screenshot URL not found in Apify response. This may be due to the Ultimate Screenshot Actor's output format. Please try a different URL format or try again later." 
      };
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
