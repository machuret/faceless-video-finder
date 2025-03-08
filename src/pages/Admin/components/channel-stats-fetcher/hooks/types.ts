
import { ChannelFormData } from "@/types/forms";
import { ChannelStatsResponse } from "supabase/functions/fetch-channel-stats-apify/types";

export interface UseChannelStatsFetcherProps {
  channelUrl: string;
  onStatsReceived: (stats: Partial<ChannelFormData>) => void;
}

export interface UseChannelStatsFetcherResult {
  loading: boolean;
  fetchingMissing: boolean;
  apiError: string | null;
  dataSource: "apify" | "youtube" | null;
  partialData: boolean;
  missingFields: string[];
  consecutiveAttempts: number;
  fetchStats: () => Promise<void>;
  fetchMissingFields: () => Promise<void>;
}

export type DataSource = "apify" | "youtube" | null;

export interface RequiredFieldDefinition {
  key: keyof ChannelStatsResponse;
  label: string;
}

export interface FieldMapping {
  [key: string]: keyof ChannelFormData;
}

export interface ProcessedChannelData {
  stats: Partial<ChannelFormData>;
  missing: string[];
  hasPartialData: boolean;
}
