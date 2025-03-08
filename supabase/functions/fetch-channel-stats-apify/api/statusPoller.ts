
import { ApifyError } from "../errors.ts";

/**
 * Polls for actor run status until it's finished
 */
export async function pollForActorStatus(runId: string, apiToken: string): Promise<{ lastStatus: string }> {
  // Poll for actor run status until it's finished
  let isFinished = false;
  let retries = 0;
  const maxRetries = 30; // Allow up to 1 minute (checking every 2 seconds)
  let lastStatus = '';
  
  console.log(`Starting to poll for actor run ${runId} status`);
  
  while (!isFinished && retries < maxRetries) {
    // Wait between status checks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`,
        {
          // Add a timeout for the request
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
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
        console.warn(`Invalid status response (retry ${retries}): ${JSON.stringify(statusData)}`);
        continue;
      }
      
      console.log(`Actor run status: ${lastStatus} (retry: ${retries}/${maxRetries})`);
      
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(lastStatus)) {
        isFinished = true;
      } else {
        retries++;
      }
    } catch (error) {
      retries++;
      console.error(`Error polling for status (retry ${retries}):`, error);
    }
  }
  
  // If we reached maximum retries but the actor is still running, we'll treat it as a success
  // and try to fetch whatever data is available
  if (lastStatus === 'RUNNING' && retries >= maxRetries) {
    console.warn(`Actor is still running after ${maxRetries} retries, will attempt to get partial data`);
    return { lastStatus: 'SUCCEEDED' };
  }
  
  if (lastStatus !== 'SUCCEEDED' && lastStatus !== 'RUNNING') {
    if (retries >= maxRetries) {
      throw new ApifyError(`Apify actor run timed out. Last status: ${lastStatus} after ${maxRetries} retries`);
    } else {
      throw new ApifyError(`Apify actor run did not succeed. Last status: ${lastStatus}`);
    }
  }
  
  return { lastStatus };
}
