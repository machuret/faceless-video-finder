
import { ApifyError } from "../errors.ts";

/**
 * Polls for actor run status until it's finished
 */
export async function pollForActorStatus(runId: string, apiToken: string): Promise<{ lastStatus: string }> {
  // Poll for actor run status until it's finished
  let isFinished = false;
  let retries = 0;
  const maxRetries = 90; // Allow up to 3 minutes (checking every 2 seconds)
  let lastStatus = '';
  
  console.log(`Starting to poll for actor run ${runId} status`);
  
  while (!isFinished && retries < maxRetries) {
    // Wait between status checks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`,
        {
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        }
      );
      
      if (!statusResponse.ok) {
        const statusText = await statusResponse.text().catch(() => 'Unable to read response');
        console.warn(`Error fetching run status (retry ${retries}): ${statusResponse.status} - ${statusText}`);
        
        // If we're hitting rate limits (429), wait longer
        if (statusResponse.status === 429) {
          console.log("Rate limit hit, waiting longer before next attempt...");
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait an additional 5 seconds
        }
        
        retries++;
        continue;
      }
      
      const statusData = await statusResponse.json();
      lastStatus = statusData.data?.status;
      
      if (!lastStatus) {
        console.warn(`Invalid status response (retry ${retries}): ${JSON.stringify(statusData)}`);
        retries++;
        continue;
      }
      
      console.log(`Actor run status: ${lastStatus} (retry: ${retries}/${maxRetries})`);
      
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(lastStatus)) {
        isFinished = true;
      } else {
        retries++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error polling for status (retry ${retries}):`, errorMessage);
      retries++;
    }
  }
  
  if (lastStatus !== 'SUCCEEDED') {
    if (retries >= maxRetries) {
      throw new ApifyError(`Apify actor run timed out after ${maxRetries * 2} seconds. This could be due to high server load or a complex YouTube channel page. Please try a different URL format (e.g., @username instead of channel/ID) or try again later.`);
    } else {
      throw new ApifyError(`Apify actor run did not succeed. Last status: ${lastStatus}. This may be due to the YouTube channel being private, non-existent, or there might be an issue with the Apify service.`);
    }
  }
  
  return { lastStatus };
}
