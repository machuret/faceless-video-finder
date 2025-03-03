
// Channel Types
export type ChannelCategory = "entertainment" | "education" | "gaming" | "music" | "news" | "sports" | "technology" | "other";

export type ChannelType = 
  | "compilation_montage"
  | "no_face_reaction"
  | "documentary_story"
  | "whiteboard_explainer"
  | "animation_2d_3d"
  | "text_based_narrative"
  | "screen_recording_tutorial"
  | "asmr_ambient"
  | "news_aggregation"
  | "stock_footage_voiceover"
  | "text_to_speech"
  | "infographic_data"
  | "hands_only_demo"
  | "audio_only_podcast"
  | "music_curation"
  | "ai_generated"
  | "original_storytelling"
  | "history_educational"
  | "fake_trailers"
  | "movie_tv_analysis"
  | "police_cam_commentary"
  | "court_reactions"
  | "live_drama_freakouts"
  | "virtual_avatar"
  | "found_footage_archival"
  | "other";

export type DatabaseChannelType = "creator" | "brand" | "media" | "other";

export type ChannelSize = "small" | "growing" | "established" | "larger" | "big";

export type UploadFrequency = "very_low" | "low" | "medium" | "high" | "very_high" | "insane";

// Video Statistics Type
export interface VideoStats {
  id?: string;
  channel_id?: string;
  video_id: string;
  title?: string;
  thumbnail_url?: string;
  views?: number;
  likes?: number;
  comments?: number;
  published_at?: string;
  duration?: string;
  description?: string;
}

// Channel Metadata Type
export interface ChannelMetadata {
  ui_channel_type?: string;
  [key: string]: any;
}

// Main Channel Type
export interface Channel {
  id: string;
  video_id: string;
  channel_title: string;
  channel_url: string;
  description?: string;
  screenshot_url?: string;
  // Change these to number types to fix TS errors while ensuring backward compatibility
  total_subscribers?: number;
  total_views?: number;
  start_date?: string;
  video_count?: number;
  cpm?: number;
  channel_type?: string;
  country?: string;
  channel_category?: ChannelCategory;
  notes?: string;
  niche?: string;
  keywords?: string[];
  is_featured?: boolean;
  upload_frequency?: string;
  revenue_per_month?: number;
  // Add missing properties that are used in the codebase
  revenue_per_video?: number;
  potential_revenue?: number;
  uses_ai?: boolean;
  channel_size?: ChannelSize;
  videoStats?: VideoStats[];
  metadata?: ChannelMetadata;
  created_at?: string;
  updated_at?: string;
}
