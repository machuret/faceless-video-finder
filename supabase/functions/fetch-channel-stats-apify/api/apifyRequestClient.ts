
import { ApifyError } from "../errors.ts";

/**
 * Handles API requests to Apify with proper error handling
 */
export async function startActorRun(input: Record<string, any>, apiToken: string): Promise<{ runId: string }> {
  console.log("Starting Apify Actor run with input:", JSON.stringify(input, null, 2));
  
  try {
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/streamers~youtube-channel-scraper/runs?token=${apiToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );
    
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
    throw new ApifyError(`Failed to start Apify actor: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetch dataset items from Apify actor run
 */
export async function fetchDataset(runId: string, apiToken: string): Promise<any[]> {
  console.log(`Fetching dataset items for run ID: ${runId}`);
  
  try {
    // This is the correct endpoint for accessing actor run default dataset
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a longer timeout for the request
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      }
    );
    
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
        console.log("Sample data keys:", Object.keys(items[0]));
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
    throw new ApifyError(`Failed to fetch dataset: ${error instanceof Error ? error.message : String(error)}`);
  }
}
