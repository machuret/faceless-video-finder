
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { cors } from "../_shared/cors.ts";

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
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        cors(req, {
          status: 500,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    
    // Get parameters from the request
    const { channelId } = await req.json();
    
    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Channel ID is required" }),
        cors(req, {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
      );
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
      return new Response(
        JSON.stringify({ error: channelError.message }),
        cors(req, {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    
    // Fetch video stats for this channel
    const { data: videoStats, error: videoError } = await supabase
      .from("youtube_video_stats")
      .select("*")
      .eq("channel_id", channelId);
      
    if (videoError) {
      console.error("Error fetching video stats:", videoError);
      // Still return the channel data, but with an empty videoStats array
      return new Response(
        JSON.stringify({ channel, videoStats: [] }),
        cors(req, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    
    return new Response(
      JSON.stringify({ channel, videoStats: videoStats || [] }),
      cors(req, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
  } catch (error) {
    console.error("Error in get-channel-by-id function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      cors(req, {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
});
