
import { corsHeaders } from "./cors.ts";
import { extractTitleFromUrl } from "./urlUtils.ts";
import { ChannelStatsResponse, ChannelDescriptionResponse } from "./types.ts";

/**
 * Helper function to provide mock data when real data can't be fetched
 */
export function provideMockData(channelUrl: string, fetchDescriptionOnly: boolean, corsHeaders: any, errorReason = "API error") {
  console.log(`Providing mock data for: ${channelUrl} (Reason: ${errorReason})`);
  
  // Mock description
  const mockDescription = "This is a sample YouTube channel description fetched by our API. " +
    "This channel is focused on creating content about technology, gaming, and lifestyle. " +
    "We post new videos every week and strive to deliver high-quality content for our viewers. " +
    "Join our community to stay updated with the latest trends and tips!";
    
  // If we're only fetching the description
  if (fetchDescriptionOnly) {
    console.log('Returning mock description');
    
    const response: ChannelDescriptionResponse = {
      success: true, 
      description: mockDescription,
      is_mock: true,
      error_reason: errorReason,
      source: "mock"
    };
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
  
  // Mock stats with a consistent naming pattern
  const mockStats: ChannelStatsResponse = {
    success: true,
    subscriberCount: 100000 + Math.floor(Math.random() * 900000),
    viewCount: 5000000 + Math.floor(Math.random() * 5000000),
    videoCount: 50 + Math.floor(Math.random() * 150),
    title: extractTitleFromUrl(channelUrl) || "Sample YouTube Channel",
    description: mockDescription,
    startDate: "2018-01-15",
    country: "US",
    is_mock: true,
    error_reason: errorReason,
    source: "mock"
  };
  
  console.log('Returning mock stats:', mockStats);
  
  return new Response(
    JSON.stringify(mockStats),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}
