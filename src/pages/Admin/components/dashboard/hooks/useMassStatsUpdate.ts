
import { useStatsUpdateProcessor } from "./utils/statsUpdateProcessor";
import { toast } from "sonner";

export interface StatsUpdateResult {
  success: boolean;
  message: string;
}

export const useMassStatsUpdate = () => {
  // Use the refactored stats update processor
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
  } = useStatsUpdateProcessor();

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
