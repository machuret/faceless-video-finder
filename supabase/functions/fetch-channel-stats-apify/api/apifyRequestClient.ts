
import { ApifyError } from "../errors.ts";

/**
 * Handles API requests to Apify with proper error handling
 */
export async function startActorRun(input: Record<string, any>, apiToken: string): Promise<{ runId: string }> {
  console.log("Starting Apify Actor run with input:", JSON.stringify(input, null, 2));
  
  try {
    // Use a longer timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
    
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/streamers~youtube-channel-scraper/runs?token=${apiToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      console.error(`Apify API error response (${runResponse.status}):`, errorText);
      throw new ApifyError(`Failed to start Apify actor: ${runResponse.status} ${runResponse.statusText}`, runResponse.status);
    }
    
    const runData = await runResponse.json();
    const runId = runData.data?.id;
    
    if (!runId) {
      console.error("Invalid response from Apify, missing run ID. Response:", JSON.stringify(runData));
      throw new ApifyError("Invalid response from Apify: Run ID not found", undefined, runData);
    }
    
    console.log(`Apify actor run started with ID: ${runId}`);
    
    return { runId };
  } catch (error) {
    console.error("Error in startActorRun:", error);
    if (error instanceof ApifyError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApifyError('Request timed out when starting Apify actor run (90s limit exceeded)');
    }
    throw new ApifyError(`Failed to start Apify actor: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetch dataset items from Apify actor run
 */
export async function fetchDataset(runId: string, apiToken: string): Promise<any[]> {
  console.log(`Fetching dataset items for run ID: ${runId}`);
  
  try {
    // Use a longer timeout for this request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
    
    // This is the correct endpoint for accessing actor run default dataset
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text();
      console.error(`Error response (${datasetResponse.status}):`, errorText);
      throw new ApifyError(`Failed to fetch dataset: ${datasetResponse.status} ${datasetResponse.statusText}`, datasetResponse.status, errorText);
    }
    
    let items;
    try {
      items = await datasetResponse.json();
      console.log(`Retrieved ${items?.length || 0} items from dataset`);
      
      // Log a sample of the data to help debug
      if (items && items.length > 0) {
        console.log("Sample data structure:", Object.keys(items[0]));
        
        // Check for key fields
        const hasSubscriberCount = 'subscriberCount' in items[0] || 
                                  (items[0].channelInfo && 'subscriberCount' in items[0].channelInfo);
        const hasDescription = 'description' in items[0] || 
                              (items[0].channelInfo && 'description' in items[0].channelInfo);
        
        console.log("Has subscriber count:", hasSubscriberCount);
        console.log("Has description:", hasDescription);
      }
    } catch (e) {
      console.error("Error parsing JSON from dataset response:", e);
      throw new ApifyError(`Failed to parse JSON from dataset response: ${e instanceof Error ? e.message : String(e)}`);
    }
    
    if (!items || items.length === 0) {
      console.error("No data returned from Apify");
      throw new ApifyError('No data returned from Apify');
    }
    
    return items;
  } catch (error) {
    console.error("Error in fetchDataset:", error);
    if (error instanceof ApifyError) {
      throw error;
    }
    if (error.name === 'AbortError') {
      throw new ApifyError('Request timed out when fetching dataset (90s limit exceeded)');
    }
    throw new ApifyError(`Failed to fetch dataset: ${error instanceof Error ? error.message : String(error)}`);
  }
}
