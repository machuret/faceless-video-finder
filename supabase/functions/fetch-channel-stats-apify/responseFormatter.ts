import { ApifyChannelData } from "./types.ts";
import { corsHeaders } from "./cors.ts";

/**
 * Utility function to safely extract a number from a string
 */
function extractNumberFromString(value: string | undefined): number {
  if (!value) return 0;
  const numberPart = value.replace(/[^0-9.]/g, '');
  const parsedNumber = parseFloat(numberPart);
  return isNaN(parsedNumber) ? 0 : parsedNumber;
}

/**
 * Utility function to format a date string
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return '';
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`Error formatting date: ${error}`);
    return '';
  }
}

/**
 * Format the channel response to provide all data we can extract regardless of request type
 */
export function formatChannelStatsResponse(channelData: ApifyChannelData) {
  // Extract all the data we can from the channel data
  return {
    success: true,
    title: channelData.channelName || '',
    subscriberCount: extractNumberFromString(channelData.numberOfSubscribers),
    viewCount: extractNumberFromString(channelData.channelTotalViews),
    videoCount: channelData.channelTotalVideos?.toString() || '0',
    startDate: formatDate(channelData.channelJoinedDate),
    description: channelData.channelDescription || '',
    country: channelData.channelLocation || '',
    url: channelData.channelUrl || '',
    source: "apify"
  };
}

/**
 * Format response with all available data, focusing on missing fields
 * This is used when we want to fetch only specific missing fields
 */
export function formatAllAvailableDataResponse(channelData: ApifyChannelData) {
  // We return all fields that we can extract, even if the request was for specific fields
  // This allows the frontend to use whatever fields were successfully fetched
  return formatChannelStatsResponse(channelData);
}

/**
 * Format the error response
 */
export function formatErrorResponse(message: string, statusCode: number = 500) {
  const body = {
    success: false,
    error: message,
    source: "apify"
  };
  
  return {
    body,
    response: new Response(
      JSON.stringify(body),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: statusCode }
    )
  };
}
