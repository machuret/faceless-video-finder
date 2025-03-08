
import { 
  APIFY_BASE_URL, 
  APIFY_ACTOR_ID, 
  APIFY_API_TOKEN, 
  MAX_POLLING_ATTEMPTS,
  POLLING_INTERVAL_MS
} from "./config.ts";
import { ApifyRunResponse, ApifyStatusResponse } from "./types.ts";

/**
 * Starts an Apify actor run to take a screenshot
 */
export async function startActorRun(url: string): Promise<{ 
  success: boolean; 
  runId?: string; 
  error?: string 
}> {
  try {
    console.log(`Starting Apify actor run for URL: ${url}`);
    
    // Use the configuration for the Ultimate Scraping actor with improved settings
    const startResponse = await fetch(`${APIFY_BASE_URL}/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "fullPage": false,
        "enableSSL": true,
        "linkUrls": [url],
        "outputFormat": "jpeg",
        "waitUntil": "networkidle2", 
        "timeouT": 180, // Increased to 180 seconds as recommended for Google Trends Scraper
        "maxRetries": 3,
        "delayBeforeScreenshot": 3000, // Increased back to 3000ms to allow more time for page elements to load
        "scrollToBottom": true, 
        "delayAfterScrolling": 1000, // Increased to 1000ms to ensure all elements render
        "window_Width": 1920,
        "window_Height": 1080,
        "printBackground": true,
        "proxyConfig": {
          "useApifyProxy": true,
          "apifyProxyGroups": ["RESIDENTIAL"]
        }
      }),
      // Add request timeout
      signal: AbortSignal.timeout(30000), // 30-second timeout for the API request itself
    });
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error("Error starting Apify actor:", errorText);
      return { 
        success: false, 
        error: `Failed to start Apify actor: ${startResponse.status} ${startResponse.statusText}` 
      };
    }
    
    const responseData = await startResponse.json() as ApifyRunResponse;
    console.log("Apify actor response:", JSON.stringify(responseData));
    
    const runId = responseData?.data?.id;
    if (!runId) {
      console.error("No run ID found in Apify response");
      return { 
        success: false, 
        error: "No run ID found in Apify response" 
      };
    }
    
    console.log(`Apify run started with ID: ${runId}`);
    return { success: true, runId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error starting Apify actor run:", errorMessage);
    return { 
      success: false, 
      error: `Error starting Apify actor run: ${errorMessage}` 
    };
  }
}

/**
 * Polls for the run to complete
 */
export async function pollForRunCompletion(runId: string): Promise<{ 
  success: boolean; 
  status?: string; 
  error?: string 
}> {
  let status = "READY";
  let attempts = 0;
  let startTime = Date.now();
  
  while (status !== "SUCCEEDED" && status !== "FAILED" && attempts < MAX_POLLING_ATTEMPTS) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    attempts++;
    
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`Checking run status (attempt ${attempts}/${MAX_POLLING_ATTEMPTS}, elapsed: ${elapsedTime}s)...`);
    
    try {
      const statusResponse = await fetch(
        `${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(15000) // 15-second timeout for status checks
        }
      );
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text().catch(() => "Could not read error response");
        console.error(`Error checking run status: ${statusResponse.status} - ${errorText}`);
        
        // If we're hitting rate limits (429), wait longer
        if (statusResponse.status === 429) {
          console.log("Rate limit hit, waiting longer before next attempt...");
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait an additional 5 seconds
        }
        
        continue;
      }
      
      const statusData = await statusResponse.json() as ApifyStatusResponse;
      status = statusData?.data?.status || status;
      
      console.log(`Run status: ${status} (attempt: ${attempts}/${MAX_POLLING_ATTEMPTS}, elapsed: ${elapsedTime}s)`);
      
      if (status === "FAILED") {
        return { 
          success: false, 
          status,
          error: `Apify run failed. This could be due to the YouTube channel being unavailable or protected.` 
        };
      }
      
      // Early success detection - if succeeded, break out early
      if (status === "SUCCEEDED") {
        break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error polling run status: ${errorMessage}`);
      // Continue polling despite errors
    }
  }
  
  if (status !== "SUCCEEDED") {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    return { 
      success: false, 
      status,
      error: `Timeout waiting for Apify run to complete after ${elapsedTime} seconds. Try a different URL format (e.g., @username instead of channel/ID) or try again later.` 
    };
  }
  
  return { success: true, status };
}
