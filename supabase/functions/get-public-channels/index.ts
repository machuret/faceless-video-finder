
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define cors function directly since import isn't working
function cors(req: Request, options: ResponseInit = {}): Response {
  // Get the origin from the request headers
  const origin = req.headers.get("origin") || "*";
  
  // Default headers for CORS
  const defaultHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
  
  // If this is an OPTIONS request, return a response with CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: defaultHeaders,
    });
  }
  
  // For all other requests, add CORS headers to the response
  return new Response(options.body, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
}

// Shared function to fetch public channel data
async function getPublicChannels(req: Request, { limit = 10, offset = 0 }) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return { error: "Server configuration error" };
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch channels with service role, bypassing RLS
    const { data, error, count } = await supabase
      .from("youtube_channels")
      .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error("Error fetching channels:", error);
      return { error: error.message };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} channels via Edge Function`);
    
    return {
      channels: data || [],
      totalCount: count || 0
    };
  } catch (err) {
    console.error("Error in getPublicChannels:", err);
    return { error: "Failed to fetch channels" };
  }
}

serve(async (req: Request) => {
  // Handle CORS for OPTIONS requests
  if (req.method === "OPTIONS") {
    return cors(req);
  }
  
  try {
    // Get parameters from the request
    const { limit, offset } = await req.json();
    
    // Call the shared function to get public channels
    const result = await getPublicChannels(req, { 
      limit: Number(limit) || 10, 
      offset: Number(offset) || 0 
    });
    
    // Return the result
    return cors(req, {
      status: result.error ? 400 : 200,
      body: JSON.stringify(result),
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in get-public-channels function:", error);
    
    return cors(req, {
      status: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: { "Content-Type": "application/json" }
    });
  }
});
