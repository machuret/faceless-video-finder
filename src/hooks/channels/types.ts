import { Channel, ChannelCategory } from "@/types/youtube";

// Video stats type for database objects - completely separate from the Channel type
export interface DbVideoStats {
  title: string;
  video_id: string;
  thumbnail_url?: string | null;
  views?: number | null;
  likes?: number | null;
}

// Database channel type with simple types to avoid circular references
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
  // Keep videoStats as a plain array of records without specific typing
  videoStats?: any[] | null;
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
