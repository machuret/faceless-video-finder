
import { ApifyError } from "../errors.ts";

/**
 * Polls for actor run status until it's finished
 */
export async function pollForActorStatus(runId: string, apiToken: string): Promise<{ lastStatus: string }> {
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
