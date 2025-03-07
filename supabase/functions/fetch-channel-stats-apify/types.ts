
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
  fetchDescriptionOnly?: boolean;
}
