
import { ApifyChannelData } from "./types.ts";
import { corsHeaders } from "./cors.ts";
import { parseDate } from "./dateUtils.ts";

/**
 * Formats a successful channel stats response
 */
export function formatChannelStatsResponse(channelData: ApifyChannelData) {
  const subscribers = typeof channelData.numberOfSubscribers === 'string' 
    ? channelData.numberOfSubscribers.replace(/,/g, '') 
    : String(channelData.numberOfSubscribers);
  
  const views = channelData.channelTotalViews?.replace(/,/g, '') || "0";
  
  return {
    success: true,
    subscriberCount: parseInt(subscribers) || 0,
    viewCount: parseInt(views) || 0,
    videoCount: parseInt(String(channelData.channelTotalVideos).replace(/,/g, '')) || 0,
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
