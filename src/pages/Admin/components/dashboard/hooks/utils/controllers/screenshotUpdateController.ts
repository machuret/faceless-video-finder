
import { toast } from "sonner";
import { fetchChannelsForScreenshotUpdate } from "../services/screenshotChannelService";
import { updateScreenshotForChannel } from "../services/screenshotUpdateService";

export interface ScreenshotUpdateOptions {
  onUpdateStart?: () => void;
  onUpdateProgress?: (processed: number, total: number, currentChannel: string | null) => void;
  onUpdateResult?: (success: boolean, message: string, url?: string) => void;
  onUpdateComplete?: (successCount: number, errorCount: number) => void;
}

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

export const initiateScreenshotUpdate = async (
  options: ScreenshotUpdateOptions = {}
): Promise<ScreenshotUpdateState> => {
  const state: ScreenshotUpdateState = {
    isProcessing: false,
    progress: 0,
    currentChannel: null,
    processedChannels: 0,
    totalChannels: 0,
    errors: [],
    successCount: 0,
    errorCount: 0,
    updatedChannels: []
  };
  
  try {
    options.onUpdateStart?.();
    state.isProcessing = true;
    
    const { channels, count } = await fetchChannelsForScreenshotUpdate();
    
    if (channels.length === 0) {
      toast.info("No channels found missing screenshots");
      return { ...state, isProcessing: false };
    }
    
    state.totalChannels = count;
    toast.info(`Starting screenshot update for ${channels.length} channels. This may take a while.`);
    
    const errors: string[] = [];
    const updatedList: string[] = [];
    
    for (let i = 0; i < channels.length; i++) {
      const channel = channels[i];
      const channelTitle = channel.channel_title || `Channel ${i+1}`;
      
      state.currentChannel = channelTitle;
      options.onUpdateProgress?.(i, channels.length, channelTitle);
      
      const result = await updateScreenshotForChannel(
        channel.id,
        channel.channel_url,
        channelTitle
      );
      
      options.onUpdateResult?.(result.success, result.message, result.screenshotUrl);
      
      if (result.success) {
        state.successCount++;
        updatedList.push(`${channelTitle} (${result.screenshotUrl || 'screenshot updated'})`);
      } else {
        state.errorCount++;
        errors.push(result.message);
      }
      
      state.processedChannels = i + 1;
      state.progress = Math.floor((state.processedChannels / channels.length) * 100);
      
      if ((state.processedChannels % 5 === 0) || state.processedChannels === channels.length) {
        toast.info(`Screenshot progress: ${state.processedChannels}/${channels.length} channels processed`);
      }
      
      if (i < channels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    state.errors = errors;
    state.updatedChannels = updatedList;
    
    if (state.errorCount > 0) {
      toast.warning(
        `Screenshot update completed: ${state.successCount} successful, ${state.errorCount} failed.`
      );
    } else {
      toast.success(`Successfully updated screenshots for all ${state.successCount} channels!`);
    }
    
    options.onUpdateComplete?.(state.successCount, state.errorCount);
    console.log("Channels updated with screenshots:", updatedList);
    
    return { ...state, isProcessing: false, currentChannel: null };
  } catch (error) {
    console.error("Error in mass screenshot update:", error);
    toast.error(`Screenshot update process encountered an error: ${error instanceof Error ? error.message : String(error)}`);
    return { ...state, isProcessing: false, currentChannel: null };
  }
};
