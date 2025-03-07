
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

import { corsHeaders } from "./cors.ts";
import { normalizeYouTubeUrl } from "./urlUtils.ts";
import { fetchChannelWithApifyAPI, ApifyError } from "./apifyService.ts";
import { provideMockData } from "./mockService.ts";
import { 
  formatChannelStatsResponse, 
  formatDescriptionResponse, 
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
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { channelUrl, fetchDescriptionOnly } = requestData;

    if (!channelUrl) {
      console.error('Missing channelUrl parameter');
      return new Response(
        JSON.stringify({ success: false, error: 'Channel URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Fetching ${fetchDescriptionOnly ? 'about section' : 'stats'} for channel: ${channelUrl}`);

    // Get Apify API token from environment variable
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_KEY") || Deno.env.get("APIFY_API_TOKEN");
    
    if (!APIFY_API_TOKEN) {
      console.error('Apify API token not configured');
      return provideMockData(
        channelUrl, 
        Boolean(fetchDescriptionOnly), 
        corsHeaders, 
        "Apify API token not configured"
      );
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
        return provideMockData(
          channelUrl, 
          Boolean(fetchDescriptionOnly), 
          corsHeaders, 
          'No data returned from Apify'
        );
      }
      
      // If we're only fetching the description
      if (fetchDescriptionOnly) {
        const response = formatDescriptionResponse(channelData);
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
      
      // More descriptive error for mock data fallback
      const errorReason = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(`API processing failed (${errorReason}), falling back to mock data`);
      
      // Fall back to mock data if API fails
      return provideMockData(channelUrl, Boolean(fetchDescriptionOnly), corsHeaders, errorReason);
    }
    
  } catch (error) {
    console.error('Error in fetch-channel-stats-apify function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
