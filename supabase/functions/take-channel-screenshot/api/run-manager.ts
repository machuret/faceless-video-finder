
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
    
    // Use the configuration that matches the successful run format shown in the example
    const startResponse = await fetch(`${APIFY_BASE_URL}/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "startUrls": [{ "url": url }],
        "waitForSelectorOnLoad": "#channel-header,#metadata-container,ytd-channel-header-renderer",
        "fullPage": false,
        "hideScrollbar": true,
        "waitForMillis": 10000, // Increased wait time for better loading
        "viewportHeight": 1200,
        "viewportWidth": 1920,
        "ignoreCookieBanners": true,
        "scrollPage": true,
        "scrollHeight": 800, 
        "maxScrollHeight": 1500,
        "saveScreenshots": true,
        "screenshotQuality": 90,
        "saveHtml": false, // Disable HTML saving to focus on screenshot only
        "saveResponses": false, // Disable response saving to speed up process
        "debugLog": true, // Enable debug logging for better troubleshooting
        "additionalMeta": {
          "name": "YouTube Channel Screenshot"
        }
      }),
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
    console.error("Error starting Apify actor run:", error);
    return { 
      success: false, 
      error: `Error starting Apify actor run: ${error.message}` 
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
  
  while (status !== "SUCCEEDED" && status !== "FAILED" && attempts < MAX_POLLING_ATTEMPTS) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    attempts++;
    
    console.log(`Checking run status (attempt ${attempts}/${MAX_POLLING_ATTEMPTS})...`);
    
    try {
      const statusResponse = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
      
      if (!statusResponse.ok) {
        console.error(`Error checking run status: ${statusResponse.status}`);
        continue;
      }
      
      const statusData = await statusResponse.json() as ApifyStatusResponse;
      status = statusData?.data?.status || status;
      
      console.log(`Run status: ${status}`);
      
      if (status === "FAILED") {
        return { 
          success: false, 
          status,
          error: "Apify run failed" 
        };
      }
    } catch (error) {
      console.error(`Error polling run status: ${error.message}`);
      // Continue polling despite errors
    }
  }
  
  if (status !== "SUCCEEDED") {
    return { 
      success: false, 
      status,
      error: "Timeout waiting for Apify run to complete" 
    };
  }
  
  return { success: true, status };
}
