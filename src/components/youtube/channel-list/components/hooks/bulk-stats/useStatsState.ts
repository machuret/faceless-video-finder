
import { useState } from "react";
import { BulkStatsState, FailedChannel, ChannelStatsResult } from "./types";

export function useStatsState(): BulkStatsState & {
  setIsProcessing: (value: boolean) => void;
  setProgress: (value: number) => void;
  setCurrentChannel: (value: string | null) => void;
  incrementSuccessCount: () => void;
  incrementErrorCount: () => void;
  setTotalCount: (value: number) => void;
  addStatsResult: (result: ChannelStatsResult) => void;
  addFailedChannel: (failedChannel: FailedChannel) => void;
  resetState: () => void;
  clearFailedChannels: () => void;
} {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [statsResults, setStatsResults] = useState<ChannelStatsResult[]>([]);
  const [failedChannels, setFailedChannels] = useState<FailedChannel[]>([]);

  const incrementSuccessCount = () => setSuccessCount(prev => prev + 1);
  const incrementErrorCount = () => setErrorCount(prev => prev + 1);
  
  const addStatsResult = (result: ChannelStatsResult) => {
    setStatsResults(prev => [...prev, result]);
  };

  const addFailedChannel = (failedChannel: FailedChannel) => {
    setFailedChannels(prev => [...prev, failedChannel]);
  };

  const resetState = () => {
    setIsProcessing(false);
    setProgress(0);
    setCurrentChannel(null);
    setSuccessCount(0);
    setErrorCount(0);
    setTotalCount(0);
    setStatsResults([]);
    setFailedChannels([]);
  };

  const clearFailedChannels = () => {
    setFailedChannels([]);
  };

  return {
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    currentChannel,
    setCurrentChannel,
    successCount,
    incrementSuccessCount,
    errorCount,
    incrementErrorCount,
    totalCount,
    setTotalCount,
    statsResults,
    addStatsResult,
    failedChannels,
    addFailedChannel,
    resetState,
    clearFailedChannels
  };
}
