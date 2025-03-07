
import { corsHeaders } from "./cors.ts";

/**
 * Helper function to provide error response when real data can't be fetched
 * (No longer provides mock data)
 */
export function provideMockData(channelUrl: string, fetchDescriptionOnly: boolean, corsHeaders: any, errorReason = "API error") {
  console.log(`Error fetching data for: ${channelUrl} (Reason: ${errorReason})`);
  
  // Return an error response instead of mock data
  const errorResponse = {
    success: false,
    error: `Failed to fetch channel data: ${errorReason}`,
    source: "apify"
  };
  
  return new Response(
    JSON.stringify(errorResponse),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
  );
}
