
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define cors function directly instead of importing
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
    const { channelId } = await req.json();
    
    if (!channelId) {
      return cors(req, {
        status: 400,
        body: JSON.stringify({ error: "Channel ID is required" }),
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch channel details with service role, bypassing RLS
    const { data: channel, error: channelError } = await supabase
      .from("youtube_channels")
      .select("*")
      .eq("id", channelId)
      .single();
      
    if (channelError) {
      console.error("Error fetching channel details:", channelError);
      return cors(req, {
        status: 400,
        body: JSON.stringify({ error: channelError.message }),
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Fetch video stats for this channel
    const { data: videoStats, error: videoError } = await supabase
      .from("youtube_video_stats")
      .select("*")
      .eq("channel_id", channelId);
      
    if (videoError) {
      console.error("Error fetching video stats:", videoError);
      // Still return the channel data, but with an empty videoStats array
      return cors(req, {
        status: 200,
        body: JSON.stringify({ channel, videoStats: [] }),
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return cors(req, {
      status: 200,
      body: JSON.stringify({ channel, videoStats: videoStats || [] }),
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in get-channel-by-id function:", error);
    
    return cors(req, {
      status: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: { "Content-Type": "application/json" }
    });
  }
});
