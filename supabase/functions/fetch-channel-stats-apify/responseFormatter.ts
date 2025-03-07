
import { ApifyChannelData } from "./types.ts";
import { corsHeaders } from "./cors.ts";

/**
 * Utility function to safely extract a number from a string
 */
function extractNumberFromString(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  
  // If value is already a number, return it directly
  if (typeof value === 'number') return value;
  
  // Ensure value is a string before using replace
  const stringValue = String(value);
  const numberPart = stringValue.replace(/[^0-9.]/g, '');
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
  // Log the incoming data to help debug issues
  console.log("Formatting channel data:", JSON.stringify(channelData, null, 2));
  
  // Special diagnostics for the problematic fields
  if (!channelData.channelDescription || channelData.channelDescription.trim() === '') {
    console.warn("⚠️ Description is missing in the channel data");
  } else {
    console.log(`✅ Description found: ${channelData.channelDescription.substring(0, 50)}...`);
  }
  
  if (!channelData.channelLocation || channelData.channelLocation.trim() === '') {
    console.warn("⚠️ Country/Location is missing in the channel data");
  } else {
    console.log(`✅ Country/Location found: ${channelData.channelLocation}`);
  }
  
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
