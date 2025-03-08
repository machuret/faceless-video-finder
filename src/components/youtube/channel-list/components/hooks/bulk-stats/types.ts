
export interface SelectedChannel {
  id: string;
  url: string;
  title: string;
}

export interface StatsResult {
  field: string;
  value: any;
  success: boolean;
}

export interface ChannelStatsResult {
  channel: SelectedChannel;
  results: StatsResult[];
  error?: string;
}

export interface FailedChannel {
  channel: SelectedChannel;
  error: string;
}

export interface BulkStatsState {
  isProcessing: boolean;
  progress: number;
  currentChannel: string | null;
  successCount: number;
  errorCount: number;
  totalCount: number;
  statsResults: ChannelStatsResult[];
  failedChannels: FailedChannel[];
}

export interface UseBulkStatsFetcherResult extends BulkStatsState {
  fetchStatsForChannels: (channels: SelectedChannel[]) => Promise<void>;
  retryFailedChannels: () => Promise<void>;
}
