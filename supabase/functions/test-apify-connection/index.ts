
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight');
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    console.log("Testing Apify API connection...");
    
    // Get Apify API token from environment variable
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_KEY") || Deno.env.get("APIFY_API_TOKEN");
    
    if (!APIFY_API_TOKEN) {
      console.error('Apify API token not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Apify API token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Just check if we can connect to Apify API and get user info
    const response = await fetch(`https://api.apify.com/v2/users/me?token=${APIFY_API_TOKEN}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to connect to Apify API: ${response.status} ${errorText}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to connect to Apify API: ${response.status}`,
          details: errorText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully connected to Apify API',
        userInfo: {
          userId: data.data?.userId,
          username: data.data?.username,
          plan: data.data?.plan
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error('Error testing Apify connection:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
