
export interface ChannelFormData {
  id?: string;
  video_id: string;
  channel_title: string;
  channel_url: string;
  description?: string;
  screenshot_url?: string;
  total_subscribers?: string;
  total_views?: string;
  start_date?: string;
  video_count?: string;
  cpm?: string;
  channel_type?: string;
  country?: string;
  channel_category?: string;
  notes?: string;
  keywords?: string[];
  is_featured?: boolean;
}
