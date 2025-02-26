
export interface Channel {
  id: string;
  video_id: string;
  screenshot_url: string | null;
  channel_title: string;
  channel_url: string;
  description: string | null;
  total_views: number | null;
  total_subscribers: number | null;
}
