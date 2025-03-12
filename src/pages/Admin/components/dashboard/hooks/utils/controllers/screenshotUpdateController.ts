
import { fetchChannelsForScreenshotUpdate } from "../services/screenshotChannelService";
import { updateScreenshotForChannel } from "../services/screenshotUpdateService";

export interface ScreenshotUpdateState {
  isProcessing: boolean;
  progress: number;
  currentChannel: string | null;
  processedChannels: number;
  totalChannels: number;
  errors: string[];
  successCount: number;
  errorCount: number;
  updatedChannels: string[];
}

interface UpdateProgressCallback {
  (processed: number, total: number, currentChannel: string | null): void;
}

interface UpdateResultCallback {
  (success: boolean, channelTitle?: string): void;
}

interface ScreenshotUpdateOptions {
  onUpdateProgress: UpdateProgressCallback;
  onUpdateResult: UpdateResultCallback;
}

/**
 * Initiates and manages the mass screenshot update process
 */
export const initiateScreenshotUpdate = async (options: ScreenshotUpdateOptions): Promise<ScreenshotUpdateState> => {
  const { onUpdateProgress, onUpdateResult } = options;
  const errors: string[] = [];
  const updatedChannels: string[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  try {
    console.log("Initiating screenshot update process...");
    
    // Step 1: Fetch channels that need screenshot updates
    const { channels, count } = await fetchChannelsForScreenshotUpdate();
    
    console.log(`Found ${channels.length} channels to update (out of ${count} total)`);
    
    if (channels.length === 0) {
      return {
        isProcessing: false,
        progress: 100,
        currentChannel: null,
        processedChannels: 0,
        totalChannels: 0,
        errors: ["No channels found that need screenshot updates."],
        successCount: 0,
        errorCount: 0,
        updatedChannels: []
      };
    }
    
    // Step 2: Process each channel
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      const channelTitle = channel.channel_title || channel.channel_url;
      
      // Update progress
      onUpdateProgress(i, channels.length, channelTitle);
      
      try {
        // Step 3: Update screenshot for current channel
        const result = await updateScreenshotForChannel(
          channel.id, 
          channel.channel_url, 
          channelTitle
        );
        
        if (result.success) {
          successCount++;
          updatedChannels.push(channelTitle);
          console.log(`Successfully updated screenshot for ${channelTitle}`);
        } else {
          errorCount++;
          errors.push(result.message);
          console.error(`Failed to update screenshot for ${channelTitle}: ${result.message}`);
        }
        
        // Report result
        onUpdateResult(result.success, channelTitle);
        
      } catch (error) {
        errorCount++;
        const errorMessage = `Error updating ${channelTitle}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage);
        
        // Report failure
        onUpdateResult(false);
      }
    }
    
    // Update final progress
    onUpdateProgress(channels.length, channels.length, null);
    
    // Return final state
    return {
      isProcessing: false,
      progress: 100,
      currentChannel: null,
      processedChannels: channels.length,
      totalChannels: channels.length,
      errors,
      successCount,
      errorCount,
      updatedChannels
    };
    
  } catch (error) {
    console.error("Screenshot update process failed:", error);
    return {
      isProcessing: false,
      progress: 0,
      currentChannel: null,
      processedChannels: 0,
      totalChannels: 0,
      errors: [`Process failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      successCount,
      errorCount,
      updatedChannels
    };
  }
};
