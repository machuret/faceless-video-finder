
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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout for API calls
    
    try {
      const userResponse = await fetch(
        `https://api.apify.com/v2/users/me?token=${APIFY_API_TOKEN}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeout);
      
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
      
      // Test access to the YouTube Channel Scraper actor (with a shorter timeout)
      const actorTimeout = setTimeout(() => controller.abort(), 3000);
      let actorData = null;
      let actorAccessible = false;
      
      try {
        const actorResponse = await fetch(
          `https://api.apify.com/v2/acts/streamers~youtube-channel-scraper?token=${APIFY_API_TOKEN}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(actorTimeout);
        
        if (actorResponse.ok) {
          actorData = await actorResponse.json();
          actorAccessible = true;
        } else {
          console.error(`Cannot access YouTube Channel Scraper: ${actorResponse.status}`);
        }
      } catch (actorError) {
        console.warn("Actor check timed out or failed, but that's okay:", actorError);
        // We'll continue even if this fails
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
    } catch (fetchError) {
      clearTimeout(timeout);
      
      if (fetchError.name === 'AbortError') {
        console.error('Apify API request timed out');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Apify API request timed out after 5 seconds' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 408 }
        );
      }
      
      throw fetchError; // Re-throw for the outer catch block
    }
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
