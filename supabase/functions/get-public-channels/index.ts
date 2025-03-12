
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

serve(async (req: Request) => {
  // Handle CORS for OPTIONS requests
  if (req.method === "OPTIONS") {
    return cors(req);
  }
  
  try {
    // Get parameters from the request
    const requestBody = await req.json();
    const { 
      limit = 10, 
      offset = 0, 
      featured = false,
      countOnly = false
    } = requestBody;
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return cors(req, {
        status: 500,
        body: JSON.stringify({ error: "Server configuration error" }),
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Handle count-only requests efficiently
    if (countOnly) {
      const { count, error: countError } = await supabase
        .from("youtube_channels")
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Error getting count:", countError);
        return cors(req, {
          status: 400,
          body: JSON.stringify({ error: countError.message }),
          headers: { "Content-Type": "application/json" }
        });
      }
      
      return cors(req, {
        status: 200,
        body: JSON.stringify({ totalCount: count || 0 }),
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Build the query
    let query = supabase
      .from("youtube_channels")
      .select('id, channel_title, description, total_subscribers, total_views, screenshot_url, niche, channel_type, is_featured, videoStats:youtube_video_stats(*)', { count: 'exact' });
    
    // Add featured filter if requested
    if (featured) {
      query = query.eq('is_featured', true);
    }
    
    // Add ordering and pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error("Error fetching channels:", error);
      return cors(req, {
        status: 400,
        body: JSON.stringify({ error: error.message }),
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`Successfully fetched ${data?.length || 0} channels via Edge Function`);
    
    return cors(req, {
      status: 200,
      body: JSON.stringify({
        channels: data || [],
        totalCount: count || 0
      }),
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
