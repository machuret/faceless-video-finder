
export type ChannelCategory = "entertainment" | "education" | "gaming" | "music" | "news" | "sports" | "technology" | "other";

// This is the type that matches with the database 
export type DatabaseChannelType = "creator" | "brand" | "media" | "other";

// This is our extended type for the UI
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
  channel_type?: string; // Use string type to accommodate any value
  channel_size?: ChannelSize;
  upload_frequency?: UploadFrequency;
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
  videoStats?: VideoStats[]; // Add this property for video statistics
}

export interface VideoStats {
  title: string;
  video_id: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  channel_id?: string;
}
