
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS preflight');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Testing Apify connection');
    
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    
    if (!APIFY_API_TOKEN) {
      console.error('Apify API token not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Apify API token not configured in environment variables' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Test API connection by getting user info
    const userResponse = await fetch(
      `https://api.apify.com/v2/users/me?token=${APIFY_API_TOKEN}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`Error response from Apify (${userResponse.status}):`, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to connect to Apify API: ${userResponse.status} ${userResponse.statusText}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: userResponse.status }
      );
    }
    
    const userData = await userResponse.json();
    
    // Test access to the YouTube Channel Scraper actor
    const actorResponse = await fetch(
      `https://api.apify.com/v2/acts/streamers~youtube-channel-scraper?token=${APIFY_API_TOKEN}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    let actorData = null;
    let actorAccessible = false;
    
    if (actorResponse.ok) {
      actorData = await actorResponse.json();
      actorAccessible = true;
    } else {
      console.error(`Cannot access YouTube Channel Scraper: ${actorResponse.status}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: userData.data.id,
          username: userData.data.username,
          plan: userData.data.subscription?.plan?.name || 'Unknown'
        },
        actorAccessible,
        actorInfo: actorAccessible ? {
          id: actorData.data.id,
          name: actorData.data.name,
          version: actorData.data.version
        } : null,
        message: "Successfully connected to Apify API"
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
