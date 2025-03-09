
import { useScreenshotUpdateProcessor } from "./utils/screenshotUpdateProcessor";

export interface ScreenshotUpdateResult {
  success: boolean;
  message: string;
}

export const useMassScreenshotUpdate = () => {
  // Use the refactored screenshot update processor
  const {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    successCount,
    errorCount,
    currentChannel,
    errors,
    startMassUpdate,
    cancelUpdate
  } = useScreenshotUpdateProcessor();

  return {
    isProcessing,
    progress,
    totalChannels,
    processedChannels,
    successCount,
    errorCount,
    currentChannel,
    errors,
    startMassUpdate,
    cancelUpdate
  };
};
