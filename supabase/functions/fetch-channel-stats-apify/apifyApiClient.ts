
import { ApifyError } from "./errors.ts";
import { ApifyChannelData } from "./types.ts";

/**
 * Fetches channel data using Apify's Fast YouTube Channel Scraper
 * This uses the streamers~youtube-channel-scraper Actor which is more reliable
 */
export async function fetchChannelWithApifyAPI(url: string, apiToken: string): Promise<ApifyChannelData> {
  console.log(`Calling Apify Fast YouTube Channel Scraper for URL: ${url}`);
  
  // Prepare the input for the Fast YouTube Channel Scraper
  const input = {
    startUrls: [{ url }],
    maxResults: 1, // We only need basic channel info, not all videos
    maxResultsShorts: 0,
    maxResultStreams: 0
  };
  
  try {
    // Start the actor run
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
  const maxRetries = 60; // Allow up to 2 minutes (checking every 2 seconds)
  let lastStatus = '';
  
  while (!isFinished && retries < maxRetries) {
    // Wait between status checks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
  console.log(`Fetching dataset items for run ID: ${runId}`);
  
  const datasetResponse = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`
  );
  
  if (!datasetResponse.ok) {
    const errorText = await datasetResponse.text();
    console.error("Error response:", errorText);
    throw new ApifyError(`Failed to fetch dataset: ${datasetResponse.status} ${datasetResponse.statusText}`, datasetResponse.status);
  }
  
  let items;
  try {
    items = await datasetResponse.json();
  } catch (e) {
    console.error("Error parsing JSON from dataset response:", e);
    throw new ApifyError(`Failed to parse JSON from dataset response: ${e.message}`);
  }
  
  console.log(`Retrieved ${items?.length || 0} items from dataset`);
  
  if (!items || items.length === 0) {
    throw new ApifyError('No data returned from Apify');
  }
  
  return processChannelData(items);
}

/**
 * Processes the channel data from Apify Fast YouTube Channel Scraper
 */
function processChannelData(items: any[]): ApifyChannelData {
  // The Fast YouTube Channel Scraper returns an array of videos
  // We need to extract the channel information which is present in each video item
  const firstItem = items[0]; // Get the first item which contains channel data
  
  if (!firstItem) {
    throw new ApifyError('Invalid data format returned from Apify - no items found');
  }
  
  console.log("Processing first item from dataset:", JSON.stringify(firstItem, null, 2).substring(0, 500) + "...");
  
  // The format is different from the old scraper, so we need to map fields
  const channelData: ApifyChannelData = {
    channelName: firstItem.channelName,
    channelDescription: firstItem.channelDescription,
    numberOfSubscribers: firstItem.numberOfSubscribers?.toString() || "0",
    channelTotalViews: firstItem.channelTotalViews || "0",
    channelTotalVideos: firstItem.channelTotalVideos || "0",
    channelJoinedDate: firstItem.channelJoinedDate,
    channelLocation: firstItem.channelLocation,
    channelUrl: firstItem.channelUrl,
    channelId: extractChannelId(firstItem.channelUrl)
  };
  
  // Verify essential fields and provide detailed diagnostic info
  console.log("Channel data verification from Fast YouTube Channel Scraper:");
  console.log(`- Channel Name: ${channelData.channelName || 'MISSING'}`);
  console.log(`- Subscribers: ${channelData.numberOfSubscribers || 'MISSING'}`);
  console.log(`- Total Views: ${channelData.channelTotalViews || 'MISSING'}`);
  console.log(`- Total Videos: ${channelData.channelTotalVideos || 'MISSING'}`);
  console.log(`- Join Date: ${channelData.channelJoinedDate || 'MISSING'}`);
  console.log(`- Description: ${channelData.channelDescription ? 'PRESENT' : 'MISSING'}`);
  console.log(`- Location: ${channelData.channelLocation || 'MISSING'}`);
  console.log(`- Channel URL: ${channelData.channelUrl || 'MISSING'}`);
  
  return channelData;
}

/**
 * Helper function to extract channel ID from YouTube channel URL
 */
function extractChannelId(url: string): string {
  if (!url) return "";
  
  try {
    // Handle different URL formats
    if (url.includes('/channel/')) {
      const matches = url.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
      return matches?.[1] || "";
    } else if (url.includes('/c/') || url.includes('/@')) {
      // For custom URLs, just return the full URL as ID
      return url;
    }
    return "";
  } catch (e) {
    console.error("Error extracting channel ID:", e);
    return "";
  }
}
