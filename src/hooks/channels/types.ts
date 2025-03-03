
import { Channel, ChannelCategory, VideoStats } from "@/types/youtube";

// Interface for database channel response to avoid type recursion
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
  // Use a more generic type for videoStats to avoid circular references
  videoStats?: any[] | null;
  [key: string]: any; // Allow for additional properties
}

// Interface for database video stats to avoid type recursion
export interface DbVideoStats {
  title: string;
  video_id: string;
  thumbnail_url?: string | null;
  views?: number | null;
  likes?: number | null;
  [key: string]: any; // Allow for additional properties
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
