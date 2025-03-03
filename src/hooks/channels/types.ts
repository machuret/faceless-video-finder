
import { ChannelCategory } from "@/types/youtube";

// State interface for the useChannels hook
export interface ChannelsState {
  channels: any[]; // Using any to avoid circular references
  featuredChannels: any[]; // Using any to avoid circular references
  loading: boolean;
  error: string | null;
  totalChannels: number;
  currentPage: number;
  showFeatured: boolean;
}

// Constants
export const CHANNELS_PER_PAGE = 9;
