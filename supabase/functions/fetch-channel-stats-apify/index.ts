
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { corsHeaders } from "./cors.ts";
import { normalizeYouTubeUrl } from "./urlUtils.ts";
import { fetchChannelWithApifyAPI } from "./apifyApiClient.ts";
import { ApifyError } from "./errors.ts";
import { provideMockData } from "./mockService.ts";
import { 
  formatChannelStatsResponse, 
  formatAllAvailableDataResponse, 
  formatErrorResponse 
} from "./responseFormatter.ts";
import { ChannelStatsRequest } from "./types.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Request received in fetch-channel-stats-apify function');
    
    // Parse request
    let requestData: ChannelStatsRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      const { response } = formatErrorResponse('Invalid JSON in request body', 400);
      return response;
    }

    const { channelUrl, fetchMissingOnly } = requestData;

    if (!channelUrl) {
      console.error('Missing channelUrl parameter');
      const { response } = formatErrorResponse('Channel URL is required', 400);
      return response;
    }
    
    console.log(`Fetching ${fetchMissingOnly ? 'missing fields' : 'stats'} for channel: ${channelUrl}`);

    // Get Apify API token from environment variable
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_KEY") || Deno.env.get("APIFY_API_TOKEN");
    
    if (!APIFY_API_TOKEN) {
      console.error('Apify API token not configured');
      const { response } = formatErrorResponse('Apify API token not configured', 500);
      return response;
    }

    try {
      // Determine if URL is for a channel or search term
      const url = normalizeYouTubeUrl(channelUrl);
      console.log(`Normalized URL: ${url}`);
      
      // Use direct API call to run the YouTube Scraper actor
      const channelData = await fetchChannelWithApifyAPI(url, APIFY_API_TOKEN);
      console.log("Apify response received");
      
      if (!channelData) {
        console.error('No data returned from Apify');
        const { response } = formatErrorResponse('No data returned from Apify', 500);
        return response;
      }
      
      // If we're fetching any missing fields, return all available data
      // so the frontend can use whatever was successfully fetched
      if (fetchMissingOnly) {
        const response = formatAllAvailableDataResponse(channelData);
        return new Response(
          JSON.stringify(response),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Format the complete response
      const channelStats = formatChannelStatsResponse(channelData);
      console.log('Returning channel stats:', channelStats);
      
      return new Response(
        JSON.stringify(channelStats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (error) {
      console.error('Error processing channel data:', error);
      
      // Return proper error response with detailed information
      const errorReason = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorDetails = error instanceof ApifyError ? error.details : undefined;
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorReason,
          details: errorDetails,
          source: "apify"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in fetch-channel-stats-apify function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        source: "apify"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
