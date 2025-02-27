
export type ChannelCategory = "entertainment" | "education" | "gaming" | "music" | "news" | "sports" | "technology" | "other";
export type ChannelType = "creator" | "brand" | "media" | "other";
export type ChannelSize = "small" | "growing" | "established" | "larger" | "big";
export type UploadFrequency = "very_low" | "low" | "medium" | "high" | "very_high" | "insane";

export interface Channel {
  id: string;
  video_id: string;
  screenshot_url: string | null;
  channel_title: string;
  channel_url: string;
  description: string | null;
  total_views: number | null;
  total_subscribers: number | null;
  channel_category?: ChannelCategory;
  channel_type?: ChannelType;
  keywords?: string[] | null;
  country?: string | null;
  niche?: string | null;
  notes?: string | null;
  cpm?: number | null;
  potential_revenue?: number | null;
  revenue_per_video?: number | null;
  revenue_per_month?: number | null;
  uses_ai?: boolean | null;
  start_date?: string | null;
  video_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}
