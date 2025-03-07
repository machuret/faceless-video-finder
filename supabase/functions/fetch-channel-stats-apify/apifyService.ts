
import { ApifyChannelData } from "./types.ts";

/**
 * Error class for Apify API failures
 */
export class ApifyError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApifyError";
    this.status = status;
  }
}

/**
 * Fetches channel data using direct Apify API calls
 */
export async function fetchChannelWithApifyAPI(url: string, apiToken: string): Promise<ApifyChannelData> {
  console.log(`Calling Apify YouTube Scraper actor with direct API call for URL: ${url}`);
  
  // Prepare Actor input
  const input = {
    "startUrls": [{ "url": url }],
    "maxVideos": 1,
    "proxy": {
      "useApifyProxy": true
    },
    "maxResults": 1
  };
  
  try {
    // Start the actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/streamers~youtube-scraper/runs?token=${apiToken}`,
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
      throw new ApifyError(`Failed to start Apify actor: ${runResponse.status} ${errorText}`, runResponse.status);
    }
    
    const runData = await runResponse.json();
    const runId = runData.data?.id;
    
    if (!runId) {
      throw new ApifyError("Invalid response from Apify: Run ID not found");
    }
    
    console.log(`Apify actor run started with ID: ${runId}`);
    
    // Poll for actor run status until it's finished
    let isFinished = false;
    let retries = 0;
    const maxRetries = 20; // Increased from 10 to 20
    let lastStatus = '';
    
    while (!isFinished && retries < maxRetries) {
      // Wait longer between status checks, increase from 3s to 5s
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`
      );
      
      if (!statusResponse.ok) {
        retries++;
        console.warn(`Error fetching run status (retry ${retries}): ${statusResponse.status}`);
        continue;
      }
      
      const statusData = await statusResponse.json();
      lastStatus = statusData.data?.status;
      
      if (!lastStatus) {
        retries++;
        console.warn(`Invalid status response (retry ${retries})`);
        continue;
      }
      
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(lastStatus)) {
        isFinished = true;
      } else {
        console.log(`Waiting for actor to finish. Current status: ${lastStatus}, retry: ${retries}/${maxRetries}`);
        retries++;
      }
    }
    
    // If we've hit max retries but the actor is still running, we should
    // check if there's any partial data available
    if (lastStatus !== 'SUCCEEDED') {
      if (retries >= maxRetries) {
        throw new ApifyError(`Apify actor run timed out. Last status: ${lastStatus} after ${maxRetries} retries`);
      } else {
        throw new ApifyError(`Apify actor run did not succeed. Last status: ${lastStatus}`);
      }
    }
    
    // Fetch the dataset items
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`
    );
    
    if (!datasetResponse.ok) {
      throw new ApifyError(`Failed to fetch dataset: ${datasetResponse.status}`, datasetResponse.status);
    }
    
    const items = await datasetResponse.json();
    console.log(`Retrieved ${items.length} items from dataset`);
    
    if (!items || items.length === 0) {
      throw new ApifyError('No data returned from Apify');
    }
    
    // Return the first item (channel data)
    return items[0] as ApifyChannelData;
  } catch (error) {
    // Re-throw Apify errors as is
    if (error instanceof ApifyError) {
      throw error;
    }
    
    // Wrap other errors
    console.error('Error in Apify API execution:', error);
    throw new ApifyError(`Apify API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
