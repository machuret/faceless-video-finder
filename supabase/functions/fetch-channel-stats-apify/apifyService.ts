
/**
 * Fetches channel data using direct Apify API calls
 */
export async function fetchChannelWithApifyAPI(url: string, apiToken: string) {
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
      throw new Error(`Failed to start Apify actor: ${runResponse.status} ${errorText}`);
    }
    
    const runData = await runResponse.json();
    const runId = runData.data.id;
    
    console.log(`Apify actor run started with ID: ${runId}`);
    
    // Poll for actor run status until it's finished
    let isFinished = false;
    let retries = 0;
    const maxRetries = 10;
    let lastStatus = '';
    
    while (!isFinished && retries < maxRetries) {
      // Wait for a few seconds before checking status
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`
      );
      
      if (!statusResponse.ok) {
        retries++;
        continue;
      }
      
      const statusData = await statusResponse.json();
      lastStatus = statusData.data.status;
      
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(lastStatus)) {
        isFinished = true;
      } else {
        retries++;
        console.log(`Waiting for actor to finish. Current status: ${lastStatus}, retry: ${retries}`);
      }
    }
    
    if (lastStatus !== 'SUCCEEDED') {
      throw new Error(`Apify actor run did not succeed. Last status: ${lastStatus}`);
    }
    
    // Fetch the dataset items
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`
    );
    
    if (!datasetResponse.ok) {
      throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`);
    }
    
    const items = await datasetResponse.json();
    console.log(`Retrieved ${items.length} items from dataset`);
    
    if (!items || items.length === 0) {
      throw new Error('No data returned from Apify');
    }
    
    // Return the first item (channel data)
    return items[0];
  } catch (error) {
    console.error('Error in Apify API execution:', error);
    throw new Error(`Apify API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
