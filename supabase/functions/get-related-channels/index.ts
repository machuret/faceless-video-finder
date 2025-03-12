
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define cors function directly
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
  // Handle CORS
  if (req.method === "OPTIONS") {
    return cors(req);
  }
  
  try {
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
    
    // Get parameters from the request
    const { channelId, niche, limit = 9 } = await req.json();
    
    if (!channelId) {
      return cors(req, {
        status: 400,
        body: JSON.stringify({ error: "Channel ID is required" }),
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Strategy 1: If we have a niche, try to fetch channels in the same niche
    let relatedChannels = [];
    
    if (niche) {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_title, description, total_subscribers, total_views, screenshot_url, niche")
        .eq("niche", niche)
        .neq("id", channelId)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (!error && data && data.length > 0) {
        relatedChannels = data;
      }
    }
    
    // Strategy 2: If niche-based approach didn't work or not enough channels, get random channels
    if (relatedChannels.length < limit) {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_title, description, total_subscribers, total_views, screenshot_url, niche")
        .neq("id", channelId)
        .order("created_at", { ascending: false })
        .limit(limit * 2);
      
      if (!error && data && data.length > 0) {
        // Merge with any existing niche-based channels and ensure no duplicates
        const existingIds = new Set(relatedChannels.map(channel => channel.id));
        const additionalChannels = data.filter(channel => !existingIds.has(channel.id));
        
        // Shuffle and take only what we need
        relatedChannels = [
          ...relatedChannels,
          ...additionalChannels.sort(() => 0.5 - Math.random())
        ].slice(0, limit);
      }
    }
    
    return cors(req, {
      status: 200,
      body: JSON.stringify(relatedChannels),
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in get-related-channels function:", error);
    
    return cors(req, {
      status: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: { "Content-Type": "application/json" }
    });
  }
});
