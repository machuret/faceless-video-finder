
export interface TopVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
}

export interface ChannelDetailsState {
  channel: Channel | null;
  videoStats: any[];
  loading: boolean;
  error: string | null;
  topVideosLoading: boolean;
  mostViewedVideo: TopVideo | null;
  mostEngagingVideo: TopVideo | null;
  topVideosError: boolean;
}

// Re-export type from main types
import { Channel } from "@/types/youtube";
export { Channel };
