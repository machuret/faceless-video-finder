
import { ApifyError } from "./errors.ts";
import { ApifyChannelData } from "./types.ts";
import { createApifyInput } from "./apifyConfig.ts";

/**
 * Fetches channel data using direct Apify API calls
 */
export async function fetchChannelWithApifyAPI(url: string, apiToken: string): Promise<ApifyChannelData> {
  console.log(`Calling Apify YouTube Scraper actor with direct API call for URL: ${url}`);
  
  // Prepare Actor input with improved settings to ensure we get all required data
  const input = createApifyInput(url);
  
  try {
    // Start the actor run
    console.log("Sending request to Apify with input:", JSON.stringify(input, null, 2).substring(0, 1000) + "...");
    
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
      console.error("Apify API error response:", errorText);
      throw new ApifyError(`Failed to start Apify actor: ${runResponse.status} ${errorText}`, runResponse.status);
    }
    
    const runData = await runResponse.json();
    const runId = runData.data?.id;
    
    if (!runId) {
      throw new ApifyError("Invalid response from Apify: Run ID not found", undefined, runData);
    }
    
    console.log(`Apify actor run started with ID: ${runId}`);
    
    // Use the poll function to wait for the actor run to complete
    const statusData = await pollForActorStatus(runId, apiToken);
    
    // Fetch and process the data
    return await fetchActorResults(runId, apiToken);
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

/**
 * Polls for actor run status until it's finished
 */
async function pollForActorStatus(runId: string, apiToken: string) {
  // Poll for actor run status until it's finished
  let isFinished = false;
  let retries = 0;
  const maxRetries = 60; // Increased to allow more time for processing
  let lastStatus = '';
  
  while (!isFinished && retries < maxRetries) {
    // Wait between status checks - longer wait times for better results
    await new Promise(resolve => setTimeout(resolve, 8000));
    
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
  
  return { lastStatus };
}

/**
 * Fetches and processes the results from Apify
 */
async function fetchActorResults(runId: string, apiToken: string): Promise<ApifyChannelData> {
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
  
  return processChannelData(items);
}

/**
 * Processes the channel data from Apify results
 */
function processChannelData(items: any[]): ApifyChannelData {
  // Process all items and merge channel data
  let channelData: ApifyChannelData = {};
  
  for (const item of items) {
    if (item.type === 'channel') {
      // Merge with existing channel data, prioritizing the current item
      channelData = { 
        ...channelData, 
        ...item,
        // Overwrite with more specific fields if they exist in this item
        channelName: item.channelName || channelData.channelName,
        channelDescription: item.channelDescription || channelData.channelDescription,
        numberOfSubscribers: item.numberOfSubscribers || channelData.numberOfSubscribers,
        channelTotalViews: item.channelTotalViews || channelData.channelTotalViews,
        channelTotalVideos: item.channelTotalVideos || channelData.channelTotalVideos,
        channelJoinedDate: item.channelJoinedDate || channelData.channelJoinedDate,
        channelLocation: item.channelLocation || channelData.channelLocation
      };
    }
  }
  
  // Verify essential fields and provide detailed diagnostic info
  console.log("Channel data verification:");
  console.log(`- Channel Name: ${channelData.channelName || 'MISSING'}`);
  console.log(`- Subscribers: ${channelData.numberOfSubscribers || 'MISSING'}`);
  console.log(`- Total Views: ${channelData.channelTotalViews || 'MISSING'}`);
  console.log(`- Total Videos: ${channelData.channelTotalVideos || 'MISSING'}`);
  console.log(`- Join Date: ${channelData.channelJoinedDate || 'MISSING'}`);
  console.log(`- Description: ${channelData.channelDescription ? 'PRESENT' : 'MISSING'}`);
  console.log(`- Location: ${channelData.channelLocation || 'MISSING'}`);
  
  return channelData;
}
