
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the provided API key or fall back to environment variable
    const APIFY_API_TOKEN = "apify_api_PSC5f5i6CXseLHByMfYouPfC1y53r92zxvDl";
    
    if (!APIFY_API_TOKEN) {
      console.error('Apify API token not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Apify API token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const { keyword, country = "us", language = "en", searchHashtags = false, removeDuplicates = true } = await req.json();

    if (!keyword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Keyword is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting keyword research for: "${keyword}" (${country}, ${language})`);

    // Call the Apify API to run the YouTube Keywords Shitter Actor
    const input = {
      keyword,
      country,
      language,
      searchHashtags,
      removeDuplicates
    };

    // Run the Actor synchronously to get results directly
    const response = await fetch(
      `https://api.apify.com/v2/acts/karamelo~youtube-keywords-shitter/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from Apify API (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to fetch keyword data: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} keyword suggestions for "${keyword}"`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        keywords: data,
        searchInfo: {
          keyword,
          country,
          language,
          searchHashtags,
          removeDuplicates,
          resultCount: data.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in youtube-keyword-research:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
