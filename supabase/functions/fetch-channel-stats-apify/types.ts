
// Represents data returned from the Apify YouTube Channel Scraper
export interface ApifyChannelData {
  channelName?: string;
  channelDescription?: string;
  numberOfSubscribers: string | number;
  channelTotalViews?: string;
  channelTotalVideos?: string;
  channelJoinedDate?: string;
  channelLocation?: string;
  channelUrl?: string;
  channelId?: string;
}

// Request structure for the Fetch Channel Stats function
export interface ChannelStatsRequest {
  channelUrl: string;
  fetchDescriptionOnly?: boolean;
}
