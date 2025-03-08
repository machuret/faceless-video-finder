
import { ApifyError } from "./errors.ts";
import { ApifyChannelData } from "./types.ts";
import { startActorRun, fetchDataset } from "./api/apifyRequestClient.ts";
import { pollForActorStatus } from "./api/statusPoller.ts";
import { processChannelData } from "./api/dataProcessor.ts";
import { createApifyInput } from "./api/apifyInputCreator.ts";

/**
 * Fetches channel data using Apify's YouTube Channel Scraper
 * This uses the streamers~youtube-scraper Actor which offers better results
 */
export async function fetchChannelWithApifyAPI(url: string, apiToken: string): Promise<ApifyChannelData> {
  console.log(`Calling Apify YouTube Channel Scraper for URL: ${url}`);
  
  try {
    // Create input for the Apify scraper
    const input = createApifyInput(url);
    
    // Start the actor run
    const { runId } = await startActorRun(input, apiToken);
    
    // Use the poll function to wait for the actor run to complete
    const statusData = await pollForActorStatus(runId, apiToken);
    console.log(`Actor run completed with status: ${statusData.lastStatus}`);
    
    // Fetch and process the data
    const items = await fetchDataset(runId, apiToken);
    console.log(`Successfully fetched ${items.length} items from Apify dataset`);
    
    // Log the first item to help with debugging
    if (items.length > 0) {
      console.log("First item data structure:", JSON.stringify(Object.keys(items[0])));
      
      // Check for critical fields like channelInfo
      if (items[0].channelInfo) {
        console.log("channelInfo is present:", JSON.stringify(items[0].channelInfo).substring(0, 200) + "...");
      } else {
        console.log("channelInfo is NOT present in response");
      }
      
      // Check for about page data which contains important stats
      if (items[0].aboutPage) {
        console.log("aboutPage is present:", JSON.stringify(items[0].aboutPage).substring(0, 200) + "...");
      } else {
        console.log("aboutPage is NOT present in response");
      }
    }
    
    // Process the channel data
    return processChannelData(items);
  } catch (error) {
    // Re-throw Apify errors
    if (error instanceof ApifyError) {
      console.error(`Apify error: ${error.message}`, error);
      throw error;
    }
    
    // Wrap other errors
    console.error('Error in Apify API execution:', error);
    throw new ApifyError(`Apify API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
