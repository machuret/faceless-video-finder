
/**
 * Channel data structure returned from Apify YouTube Channel Scraper 
 */
export interface ApifyChannelData {
  channelName?: string;
  channelDescription?: string;
  numberOfSubscribers?: string;
  channelTotalViews?: string;
  channelTotalVideos?: string | number;
  channelJoinedDate?: string;
  channelLocation?: string;
  channelUrl?: string;
  channelId?: string;
}

/**
 * Request structure for the edge function
 */
export interface ChannelStatsRequest {
  channelUrl: string;
  fetchMissingOnly?: boolean;  // More generic flag to fetch any missing fields
}

/**
 * Response structure from the edge function
 */
export interface ChannelStatsResponse {
  success: boolean;
  title?: string;
  subscriberCount?: number;
  viewCount?: number;
  videoCount?: string;
  startDate?: string;
  description?: string;
  country?: string;
  url?: string;
  source?: string;
  error?: string;
  details?: any;
}
