
import { ApifyError } from "../errors.ts";
import { startActorRun, fetchDataset } from "./apifyRequestClient.ts";
import { pollForActorStatus } from "./statusPoller.ts";
import { createApifyInput } from "./apifyInputCreator.ts";

/**
 * A simplified version of the fetcher that just tries to get the channel title
 * This is used for testing the connection to Apify
 */
export async function fetchChannelTitleOnly(url: string, apiToken: string): Promise<string | null> {
  console.log(`Testing Apify connection with URL: ${url} (title only)`);
  
  try {
    // Create simplified input for the Apify scraper
    const input = createApifyInput(url);
    
    // Start the actor run
    const { runId } = await startActorRun(input, apiToken);
    console.log(`Started test run with ID: ${runId}`);
    
    // Use the poll function to wait for the actor run to complete
    const statusData = await pollForActorStatus(runId, apiToken);
    console.log(`Test run completed with status: ${statusData.lastStatus}`);
    
    // Fetch just the dataset items (first item only)
    const items = await fetchDataset(runId, apiToken);
    
    if (!items || items.length === 0) {
      console.log("No items returned from test fetch");
      return null;
    }
    
    // Extract the channel title from whatever structure we get
    const firstItem = items[0];
    
    // Try to get the title from various possible locations
    const title = firstItem.channelName || 
                  firstItem.channelInfo?.title || 
                  firstItem.channel?.title ||
                  firstItem.title ||
                  null;
    
    console.log(`Successfully extracted title for testing: ${title}`);
    return title;
  } catch (error) {
    console.error(`Error in test fetch: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}
