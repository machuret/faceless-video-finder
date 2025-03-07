
import { ApifyChannelData } from "./types.ts";
import { formatDate } from "./dateUtils.ts";
import { corsHeaders } from "../_shared/cors.ts";

export function formatChannelStatsResponse(data: ApifyChannelData) {
  console.log("Formatting channel data response");
  
  // Extract basic channel info
  const title = data.channelName || data.title || '';
  const subscriberCount = data.numberOfSubscribers || data.subscriberCount || 0;
  const viewCount = data.channelTotalViews || data.viewCount || 0;
  const videoCount = data.channelTotalVideos || data.videoCount || 0;
  
  // Handle dates: Try both channelJoinedDate and joinedDate fields
  const rawDate = data.channelJoinedDate || data.joinedDate || '';
  console.log(`Raw date before formatting: "${rawDate}"`);
  const startDate = formatDate(rawDate);
  console.log(`Formatted date: ${startDate}`);
  
  // Get description
  const description = data.channelDescription || data.description || '';
  
  // Get country/location
  const country = data.channelLocation || data.country || '';
  
  // Validate required fields
  const missingFields = [];
  if (!viewCount) missingFields.push('viewCount');
  if (!videoCount) missingFields.push('videoCount');
  if (!startDate) missingFields.push('startDate');
  if (!description) missingFields.push('description');
  if (!country) missingFields.push('country');
  
  if (missingFields.length > 0) {
    console.error(`Warning: Missing channel data fields: ${missingFields.join(', ')}`);
  }
  
  return {
    success: true,
    title,
    subscriberCount,
    viewCount,
    videoCount,
    startDate,
    description,
    country,
    source: "apify",
    missingFields: missingFields.length > 0 ? missingFields : undefined
  };
}

export function formatDescriptionResponse(data: ApifyChannelData) {
  return {
    success: true,
    description: data.channelDescription || data.description || '',
    source: "apify"
  };
}

export function formatErrorResponse(errorMessage: string, statusCode: number = 500) {
  console.error(`Error response: ${errorMessage} (${statusCode})`);
  
  const response = new Response(
    JSON.stringify({
      success: false,
      error: errorMessage,
      source: "apify"
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode
    }
  );
  
  return { response };
}
