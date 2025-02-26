
export type ChannelCategory = "finance" | "tech" | "cooking" | "fitness" | "travel" | "other";
export type ChannelType = "educational" | "entertainment" | "gaming" | "lifestyle" | "other";

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
}
