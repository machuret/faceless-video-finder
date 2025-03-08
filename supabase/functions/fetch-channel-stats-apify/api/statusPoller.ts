
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
          signal: AbortSignal.timeout(5000), // 5 second timeout
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!statusResponse.ok) {
        const statusText = await statusResponse.text().catch(() => 'Unable to read response');
        console.warn(`Error fetching run status (retry ${retries}): ${statusResponse.status} - ${statusText}`);
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
  
  // If we reached maximum retries but the actor is still running, we'll treat it as a success
  // and try to fetch whatever data is available
  if (lastStatus === 'RUNNING' && retries >= maxRetries) {
    console.warn(`Actor is still running after ${maxRetries} retries, will attempt to get partial data`);
    return { lastStatus: 'SUCCEEDED' };
  }
  
  if (lastStatus !== 'SUCCEEDED' && lastStatus !== 'RUNNING') {
    if (retries >= maxRetries) {
      throw new ApifyError(`Apify actor run timed out after ${maxRetries * 2} seconds. Last status: ${lastStatus}`, {
        status: lastStatus,
        retries: retries,
        maxRetries: maxRetries
      });
    } else {
      throw new ApifyError(`Apify actor run failed with status: ${lastStatus}. This might indicate the YouTube channel is unavailable or the URL format is incorrect.`, {
        status: lastStatus
      });
    }
  }
  
  return { lastStatus };
}
