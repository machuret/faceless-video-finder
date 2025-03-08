
import { ApifyError } from "../errors.ts";

export interface PollResult {
  lastStatus: string;
  isFinished: boolean;
}

/**
 * Polls the Apify actor run status until it completes or fails
 */
export async function pollForActorStatus(runId: string, apiToken: string): Promise<PollResult> {
  console.log(`Starting to poll for status of run ${runId}`);
  
  let attempts = 0;
  const maxAttempts = 30; // Increased to 30 for longer running tasks
  const pollInterval = 5000; // 5 seconds
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Polling attempt ${attempts}/${maxAttempts}`);
    
    try {
      const response = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response (${response.status}):`, errorText);
        
        // If we're hitting rate limits (429), wait longer before retrying
        if (response.status === 429) {
          console.log("Rate limit hit, waiting longer before next attempt...");
          await new Promise(resolve => setTimeout(resolve, pollInterval * 2));
          continue;
        }
        
        throw new ApifyError(`Failed to check run status: ${response.status} ${response.statusText}`, response.status);
      }

      const data = await response.json();
      const status = data?.data?.status;
      console.log(`Run status: ${status} (attempt ${attempts}/${maxAttempts})`);

      if (status === 'SUCCEEDED' || status === 'FINISHED') {
        console.log(`Run ${runId} completed successfully`);
        return { lastStatus: status, isFinished: true };
      }

      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        console.error(`Run ${runId} failed with status ${status}`);
        throw new ApifyError(`Apify run failed with status: ${status}`);
      }

      // If still running, wait and check again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      // Only re-throw errors that are not related to polling logic
      if (error instanceof ApifyError) {
        throw error;
      }
      
      console.error(`Error while polling: ${error instanceof Error ? error.message : String(error)}`);
      
      // Wait before retrying after a polling error
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  console.error(`Polling timed out after ${maxAttempts} attempts`);
  throw new ApifyError(`Polling timed out after ${maxAttempts} attempts`);
}
