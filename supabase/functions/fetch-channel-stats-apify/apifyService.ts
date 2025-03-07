
import { ApifyChannelData } from "./types.ts";

/**
 * Error class for Apify API failures
 */
export class ApifyError extends Error {
  status?: number;
  details?: any;
  
  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = "ApifyError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Fetches channel data using direct Apify API calls
 */
export async function fetchChannelWithApifyAPI(url: string, apiToken: string): Promise<ApifyChannelData> {
  console.log(`Calling Apify YouTube Scraper actor with direct API call for URL: ${url}`);
  
  // Prepare Actor input with improved settings to ensure we get all required data
  const input = {
    "startUrls": [{ "url": url }],
    "maxVideos": 1,
    "proxy": {
      "useApifyProxy": true
    },
    "maxResults": 1,
    "extendOutputFunction": `async ({ data, customData, Apify }) => {
      // Ensure full channel details are captured, especially the About tab
      if (data && data.type === 'channel') {
        // Log that we're in the extendOutputFunction for debugging
        console.log('Processing channel data in extendOutputFunction');
        
        // Make sure we capture the About section for channel description
        if (!data.channelDescription || data.channelDescription.trim() === '') {
          console.log('Channel description missing, attempting to fetch from About page');
          const aboutPageUrl = data.url + '/about';
          try {
            const request = await Apify.utils.requestAsBrowser({ url: aboutPageUrl });
            const html = request.body;
            
            // Extract description from About page using appropriate selectors
            // This is a simplified approach - actual implementation may need to be adjusted
            const descriptionMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
            if (descriptionMatch && descriptionMatch[1]) {
              data.channelDescription = descriptionMatch[1];
              console.log('Successfully extracted description from About page');
            }
            
            // Extract join date
            const joinDateMatch = html.match(/Channel created on (.+?)<\\/span>/);
            if (joinDateMatch && joinDateMatch[1]) {
              data.channelJoinedDate = joinDateMatch[1];
              console.log('Successfully extracted join date');
            }
            
            // Extract country
            const countryMatch = html.match(/Location:<\\/span>.*?>([^<]+)</);
            if (countryMatch && countryMatch[1]) {
              data.channelLocation = countryMatch[1].trim();
              console.log('Successfully extracted country');
            }
          } catch (e) {
            console.log('Error fetching about page:', e);
          }
        }
      }
      return data;
    }`
  };
  
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
    
    // Poll for actor run status until it's finished
    let isFinished = false;
    let retries = 0;
    const maxRetries = 30; // Increased to allow more time for processing
    let lastStatus = '';
    
    while (!isFinished && retries < maxRetries) {
      // Wait between status checks
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
    
    // Get the first item (channel data)
    const channelData = items[0] as ApifyChannelData;
    
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
