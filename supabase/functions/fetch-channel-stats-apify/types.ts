
/**
 * Types for Apify YouTube channel data
 */

// Raw channel data from Apify
export interface ApifyChannelData {
  channelName?: string;
  channelDescription?: string;
  numberOfSubscribers?: number;
  channelTotalViews?: string;
  channelTotalVideos?: number;
  channelJoinedDate?: string;
  channelLocation?: string;
  [key: string]: any; // Allow for additional properties from Apify
}

// Processed channel data we return to the client
export interface ChannelStatsResponse {
  success: boolean;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  title: string;
  description: string;
  startDate: string;
  country: string;
  source: "apify" | "youtube" | "mock";
  is_mock?: boolean;
  error_reason?: string;
}

// Description-only response
export interface ChannelDescriptionResponse {
  success: boolean;
  description: string;
  source: "apify" | "youtube" | "mock";
  is_mock?: boolean;
  error_reason?: string;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  source?: string;
}

// Request parameters
export interface ChannelStatsRequest {
  channelUrl: string;
  fetchDescriptionOnly?: boolean;
}
