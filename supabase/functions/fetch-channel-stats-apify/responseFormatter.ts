
import { ApifyChannelData } from "./types.ts";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Formats the full channel stats response from Apify data
 */
export function formatChannelStatsResponse(channelData: ApifyChannelData) {
  // Convert subscriber count from string to number if needed
  let subscriberCount = channelData.numberOfSubscribers;
  if (typeof subscriberCount === 'string') {
    // Remove commas and convert to number
    subscriberCount = parseInt(subscriberCount.replace(/,/g, ''));
  }

  // Convert view count from string to number if needed
  let viewCount = 0;
  if (typeof channelData.channelTotalViews === 'string') {
    // Remove commas and convert to number
    viewCount = parseInt(channelData.channelTotalViews.replace(/,/g, '')) || 0;
  }

  // Convert video count from string to number if needed
  let videoCount = 0;
  if (typeof channelData.channelTotalVideos === 'string') {
    // Remove commas and convert to number
    videoCount = parseInt(channelData.channelTotalVideos.replace(/,/g, '')) || 0;
  }

  // Parse join date
  let formattedStartDate = '';
  if (channelData.channelJoinedDate) {
    try {
      // Try to format different date formats 
      const joinDate = channelData.channelJoinedDate; // "Jan 4, 2017"
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      
      // Parse dates like "Jan 4, 2017" or "January 4, 2017"
      const dateRegex = /([A-Za-z]+)\s+(\d+),?\s+(\d{4})/;
      const match = joinDate.match(dateRegex);
      
      if (match) {
        const monthName = match[1].substring(0, 3); // Get first 3 letters of month
        const month = months[monthName];
        const day = match[2].padStart(2, '0');
        const year = match[3];
        
        if (month && day && year) {
          formattedStartDate = `${year}-${month}-${day}`;
        }
      }
    } catch (e) {
      console.error("Error parsing start date:", e);
    }
  }

  // Put together the response
  const response = {
    success: true,
    subscriberCount,
    viewCount,
    videoCount,
    title: channelData.channelName || "",
    description: channelData.channelDescription || "",
    startDate: formattedStartDate,
    country: channelData.channelLocation || "",
    source: "apify"
  };

  return response;
}

/**
 * Formats just the description response
 */
export function formatDescriptionResponse(channelData: ApifyChannelData) {
  return {
    success: true,
    description: channelData.channelDescription || "",
    source: "apify"
  };
}

/**
 * Creates a standardized error response
 */
export function formatErrorResponse(errorMessage: string, status = 500) {
  const response = new Response(
    JSON.stringify({ 
      success: false, 
      error: errorMessage,
      source: "apify" 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: status 
    }
  );
  
  return { response };
}
