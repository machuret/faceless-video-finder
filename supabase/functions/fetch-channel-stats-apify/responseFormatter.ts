
import { ApifyChannelData, ChannelStatsResponse, ChannelDescriptionResponse, ErrorResponse } from "./types.ts";
import { formatDate } from "./dateUtils.ts";

/**
 * Formats the channel data into a complete response
 */
export function formatChannelStatsResponse(channelData: ApifyChannelData, isMock = false, errorReason?: string): ChannelStatsResponse {
  console.log("Formatting channel stats from raw data:", JSON.stringify(channelData).substring(0, 500) + "...");
  
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
  
  // Format subscriber count safely
  let subscriberCount = 0;
  if (typeof channelData.numberOfSubscribers === 'string') {
    subscriberCount = parseInt(channelData.numberOfSubscribers.replace(/,/g, '') || "0");
  } else if (typeof channelData.numberOfSubscribers === 'number') {
    subscriberCount = channelData.numberOfSubscribers;
  }
  subscriberCount = isNaN(subscriberCount) ? 0 : subscriberCount;
  
  // Format video count safely
  let videoCount = 0;
  if (typeof channelData.channelTotalVideos === 'string') {
    videoCount = parseInt(channelData.channelTotalVideos.replace(/,/g, '') || "0");
  } else if (typeof channelData.channelTotalVideos === 'number') {
    videoCount = channelData.channelTotalVideos;
  }
  videoCount = isNaN(videoCount) ? 0 : videoCount;
  
  // Create formatted response object
  const response: ChannelStatsResponse = {
    success: true,
    subscriberCount: subscriberCount,
    viewCount: viewCount,
    videoCount: videoCount,
    title: channelData.channelName || "",
    description: channelData.channelDescription || "",
    startDate: formatDate(channelData.channelJoinedDate || "") || "",
    country: channelData.channelLocation || "",
    source: "apify",
    ...(isMock && { is_mock: true, error_reason: errorReason })
  };
  
  // Log the formatted response for debugging
  console.log("Formatted channel stats response:", JSON.stringify(response));
  
  // Verify all required fields have values
  const missingFields = [];
  if (!response.subscriberCount) missingFields.push("subscriberCount");
  if (!response.viewCount) missingFields.push("viewCount");
  if (!response.videoCount) missingFields.push("videoCount");
  if (!response.title) missingFields.push("title");
  if (!response.description) missingFields.push("description");
  if (!response.startDate) missingFields.push("startDate");
  
  if (missingFields.length > 0) {
    console.warn(`Warning: Missing channel data fields: ${missingFields.join(", ")}`);
  }
  
  return response;
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
