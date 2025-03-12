
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
    const { channelId, niche, limit } = await req.json();
    
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
    
    // First try to find channels in the same niche if provided
    if (niche) {
      const { data: nicheData, error: nicheError } = await supabase
        .from("youtube_channels")
        .select("id, channel_title, description, total_subscribers, total_views, screenshot_url, niche")
        .eq("niche", niche)
        .neq("id", channelId)
        .order("created_at", { ascending: false })
        .limit(limit || 9);
      
      if (!nicheError && nicheData && nicheData.length > 0) {
        console.log(`Found ${nicheData.length} channels in the same niche "${niche}"`);
        
        // Return the data after shuffling to randomize results
        return new Response(
          JSON.stringify([...nicheData].sort(() => 0.5 - Math.random())),
          cors(req, {
            status: 200,
            headers: { "Content-Type": "application/json" }
          })
        );
      }
    }
    
    // Fallback: get random channels
    const { data: randomData, error: randomError } = await supabase
      .from("youtube_channels")
      .select("id, channel_title, description, total_subscribers, total_views, screenshot_url, niche")
      .neq("id", channelId)
      .order("created_at", { ascending: false })
      .limit((limit || 9) * 2);
      
    if (randomError) {
      console.error("Error fetching random channels:", randomError);
      return new Response(
        JSON.stringify({ error: randomError.message }),
        cors(req, {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    
    if (!randomData || randomData.length === 0) {
      return new Response(
        JSON.stringify([]),
        cors(req, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      );
    }
    
    // Shuffle and take only needed amount
    const shuffledData = [...randomData]
      .sort(() => 0.5 - Math.random())
      .slice(0, limit || 9);
    
    return new Response(
      JSON.stringify(shuffledData),
      cors(req, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
  } catch (error) {
    console.error("Error in get-related-channels function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      cors(req, {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
});
