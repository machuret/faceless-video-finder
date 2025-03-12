
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    const { channelId } = await req.json();
    
    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Channel ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing database configuration" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch the channel data
    const { data: channel, error: channelError } = await supabase
      .from("youtube_channels")
      .select("*")
      .eq("id", channelId)
      .single();
    
    if (channelError) {
      console.error("Error fetching channel:", channelError);
      return new Response(
        JSON.stringify({ error: channelError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Fetch video stats for this channel
    const { data: videoStats, error: videoError } = await supabase
      .from("youtube_video_stats")
      .select("*")
      .eq("channel_id", channelId);
    
    if (videoError) {
      console.error("Error fetching video stats:", videoError);
      // Continue despite video stats error, as we still have channel data
    }
    
    return new Response(
      JSON.stringify({
        channel: channel || null,
        videoStats: videoStats || []
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Unhandled error in get-channel-by-id:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
