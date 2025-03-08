
import { ApifyError } from "./errors.ts";
import { ApifyChannelData } from "./types.ts";
import { startActorRun, fetchDataset } from "./api/apifyRequestClient.ts";
import { pollForActorStatus } from "./api/statusPoller.ts";
import { processChannelData } from "./api/dataProcessor.ts";
import { createApifyInput } from "./api/apifyInputCreator.ts";

/**
 * Fetches channel data using Apify's Fast YouTube Channel Scraper
 * This uses the streamers~youtube-channel-scraper Actor which is more reliable
 */
export async function fetchChannelWithApifyAPI(url: string, apiToken: string): Promise<ApifyChannelData> {
  console.log(`Calling Apify Fast YouTube Channel Scraper for URL: ${url}`);
  
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
      // Check for critical fields
      const criticalFields = ["channelInfo", "statistics", "snippet", "aboutPage"];
      criticalFields.forEach(field => {
        if (items[0][field]) {
          console.log(`${field} is present:`, JSON.stringify(items[0][field]).substring(0, 200) + "...");
        } else {
          console.log(`${field} is NOT present in response`);
        }
      });
    }
    
    // Process the channel data
    return processChannelData(items);
  } catch (error) {
    // Re-throw Apify errors as is
    if (error instanceof ApifyError) {
      console.error(`Apify error: ${error.message}`, error);
      throw error;
    }
    
    // Wrap other errors
    console.error('Error in Apify API execution:', error);
    throw new ApifyError(`Apify API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
