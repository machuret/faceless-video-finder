import { Channel, ChannelCategory } from "@/types/youtube";

// Simple types to prevent circular references
export interface DbVideoStats {
  title: string;
  video_id: string;
  thumbnail_url?: string | null;
  views?: number | null;
  likes?: number | null;
}

// Simplified database channel type without circular references
export interface DbChannel {
  id: string;
  channel_title: string;
  channel_url: string;
  video_id: string;
  description?: string | null;
  screenshot_url?: string | null;
  total_subscribers?: number | null; 
  total_views?: number | null;
  channel_category?: ChannelCategory | null;
  channel_type?: string | null;
  keywords?: string[] | null;
  niche?: string | null;
  country?: string | null;
  cpm?: number | null;
  is_featured?: boolean;
  // Note: we're keeping this as a record type, not a typed array
  videoStats?: Record<string, any>[] | null;
}

// State interface for the useChannels hook
export interface ChannelsState {
  channels: Channel[];
  featuredChannels: Channel[];
  loading: boolean;
  error: string | null;
  totalChannels: number;
  currentPage: number;
  showFeatured: boolean;
}

// Constants
export const CHANNELS_PER_PAGE = 9;
