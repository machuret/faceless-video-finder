
import { ApifyChannelData } from "./types.ts";
import { corsHeaders } from "./cors.ts";
import { parseDate } from "./dateUtils.ts";

/**
 * Formats a successful channel stats response
 */
export function formatChannelStatsResponse(channelData: ApifyChannelData) {
  // Log what we're working with
  console.log("Formatting channel data response with:", channelData);
  
  // Clean and parse subscriber count (remove commas and convert to number)
  let subscribers = typeof channelData.numberOfSubscribers === 'string' 
    ? channelData.numberOfSubscribers.replace(/,/g, '') 
    : String(channelData.numberOfSubscribers || 0);
  
  // Clean and parse view count
  let views = typeof channelData.channelTotalViews === 'string'
    ? channelData.channelTotalViews.replace(/,/g, '')
    : String(channelData.channelTotalViews || 0);
  
  // Clean and parse video count
  let videoCount = typeof channelData.channelTotalVideos === 'string'
    ? channelData.channelTotalVideos.replace(/,/g, '')
    : String(channelData.channelTotalVideos || 0);
  
  // Make sure we have valid numbers, defaulting to 0 if parsing fails
  const subscriberCount = parseInt(subscribers) || 0;
  const viewCount = parseInt(views) || 0;
  const totalVideoCount = parseInt(videoCount) || 0;
  
  // Log what we've parsed
  console.log("Parsed numeric values:", {
    subscriberCount,
    viewCount,
    totalVideoCount
  });
  
  return {
    success: true,
    subscriberCount: subscriberCount,
    viewCount: viewCount,
    videoCount: totalVideoCount,
    title: channelData.channelName || "",
    description: channelData.channelDescription || "",
    startDate: parseDate(channelData.channelJoinedDate || ""),
    country: channelData.channelLocation || "",
    channelId: channelData.channelId || "",
    source: "apify"
  };
}

/**
 * Formats a channel description-only response
 */
export function formatDescriptionResponse(channelData: ApifyChannelData) {
  return {
    success: true,
    description: channelData.channelDescription || "",
    source: "apify"
  };
}

/**
 * Formats an error response
 */
export function formatErrorResponse(message: string, statusCode: number = 500) {
  console.error(`Error response: ${message} (${statusCode})`);
  
  const response = new Response(
    JSON.stringify({
      success: false,
      error: message,
      source: "apify"
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: statusCode 
    }
  );
  
  return { response, error: message };
}
