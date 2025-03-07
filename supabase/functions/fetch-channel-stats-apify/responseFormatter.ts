
import { ApifyChannelData, ChannelStatsResponse, ChannelDescriptionResponse, ErrorResponse } from "./types.ts";
import { formatDate } from "./dateUtils.ts";

/**
 * Formats the channel data into a complete response
 */
export function formatChannelStatsResponse(channelData: ApifyChannelData, isMock = false, errorReason?: string): ChannelStatsResponse {
  // Parse view count safely - handle different data types
  let viewCount = 0;
  
  if (typeof channelData.channelTotalViews === 'string') {
    // If it's a string, try to remove commas and parse
    viewCount = parseInt(channelData.channelTotalViews.replace(/,/g, '') || "0");
  } else if (typeof channelData.channelTotalViews === 'number') {
    // If it's already a number, use it directly
    viewCount = channelData.channelTotalViews;
  }
  
  // Make sure we have a valid number, not NaN
  viewCount = isNaN(viewCount) ? 0 : viewCount;
  
  return {
    success: true,
    subscriberCount: channelData.numberOfSubscribers || 0,
    viewCount: viewCount,
    videoCount: channelData.channelTotalVideos || 0,
    title: channelData.channelName || "",
    description: channelData.channelDescription || "",
    startDate: formatDate(channelData.channelJoinedDate || "") || "",
    country: channelData.channelLocation || "",
    source: "apify",
    ...(isMock && { is_mock: true, error_reason: errorReason })
  };
}

/**
 * Formats the channel data into a description-only response
 */
export function formatDescriptionResponse(channelData: ApifyChannelData, isMock = false, errorReason?: string): ChannelDescriptionResponse {
  return {
    success: true,
    description: channelData.channelDescription || "",
    source: "apify",
    ...(isMock && { is_mock: true, error_reason: errorReason })
  };
}

/**
 * Formats an error response
 */
export function formatErrorResponse(message: string, status = 500): { response: Response, error: ErrorResponse } {
  const error: ErrorResponse = {
    success: false,
    error: message,
    source: "apify"
  };
  
  return {
    response: new Response(JSON.stringify(error), { status }),
    error
  };
}
