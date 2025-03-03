
import { ChannelCategory } from "@/types/youtube";

// Video stats type that's completely independent
export interface DbVideoStats {
  title: string;
  video_id: string;
  thumbnail_url?: string | null;
  views?: number | null;
  likes?: number | null;
}

// Database channel type with NO reference to any video stats
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
  // No videoStats property here
}

// State interface for the useChannels hook
export interface ChannelsState {
  channels: any[]; // Using any to break circular references
  featuredChannels: any[]; // Using any to break circular references
  loading: boolean;
  error: string | null;
  totalChannels: number;
  currentPage: number;
  showFeatured: boolean;
}

// Constants
export const CHANNELS_PER_PAGE = 9;
