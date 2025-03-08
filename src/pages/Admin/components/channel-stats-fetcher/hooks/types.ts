
export interface UseChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: any) => void;
}

export type DataSource = "apify" | "youtube" | null;

export interface UseChannelStatsFetcherResult {
  loading: boolean;
  fetchingMissing: boolean;
  testingConnection: boolean;
  apiError: string | null;
  dataSource: DataSource;
  partialData: boolean;
  missingFields: string[];
  consecutiveAttempts: number;
  fetchStats: () => Promise<void>;
  fetchMissingFields: () => Promise<void>;
  testApifyConnection: () => Promise<void>;
}

export interface ProcessedChannelData {
  stats: any;
  missing: string[];
  hasPartialData: boolean;
}

export interface ChannelStatsResult {
  channel: {
    id: string;
    title: string;
    url: string;
  };
  results: {
    field: string;
    value: any;
    success: boolean;
  }[];
  error?: string;
}
