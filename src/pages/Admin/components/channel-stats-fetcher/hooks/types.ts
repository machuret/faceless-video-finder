
import { ChannelFormData } from "@/types/forms";

export interface UseChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
}

export type DataSource = "apify" | "youtube" | null;

export interface ProcessedChannelData {
  stats: Partial<ChannelFormData>;
  missing: string[];
  hasPartialData: boolean;
}

export interface UseChannelStatsFetcherResult {
  loading: boolean;
  fetchingMissing: boolean;
  apiError: string | null;
  dataSource: DataSource;
  partialData: boolean;
  missingFields: string[];
  consecutiveAttempts: number;
  fetchStats: () => Promise<void>;
  fetchMissingFields: () => Promise<void>;
}

export interface UrlFormatOptions {
  preferredFormat?: 'channel' | 'username' | 'custom';
}

export interface RequiredFieldDefinition {
  key: string;
  label: string;
}
