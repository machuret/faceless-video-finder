
import { ApifyError } from "../errors.ts";

/**
 * Handles API requests to Apify with proper error handling
 */
export async function startActorRun(input: Record<string, any>, apiToken: string): Promise<{ runId: string }> {
  console.log("Starting Apify Actor run with input:", JSON.stringify(input, null, 2));
  
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
    console.error("Apify API error response:", errorText);
    throw new ApifyError(`Failed to start Apify actor: ${runResponse.status} ${errorText}`, runResponse.status);
  }
  
  const runData = await runResponse.json();
  const runId = runData.data?.id;
  
  if (!runId) {
    throw new ApifyError("Invalid response from Apify: Run ID not found", undefined, runData);
  }
  
  console.log(`Apify actor run started with ID: ${runId}`);
  
  return { runId };
}

/**
 * Fetch dataset items from Apify actor run
 */
export async function fetchDataset(runId: string, apiToken: string): Promise<any[]> {
  console.log(`Fetching dataset items for run ID: ${runId}`);
  
  // This is the correct endpoint for accessing actor run default dataset
  const datasetResponse = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`,
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
  
  if (!datasetResponse.ok) {
    const errorText = await datasetResponse.text();
    console.error("Error response:", errorText);
    throw new ApifyError(`Failed to fetch dataset: ${datasetResponse.status} ${datasetResponse.statusText}`, datasetResponse.status, errorText);
  }
  
  let items;
  try {
    items = await datasetResponse.json();
  } catch (e) {
    console.error("Error parsing JSON from dataset response:", e);
    throw new ApifyError(`Failed to parse JSON from dataset response: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  console.log(`Retrieved ${items?.length || 0} items from dataset`);
  
  if (!items || items.length === 0) {
    throw new ApifyError('No data returned from Apify');
  }
  
  return items;
}
