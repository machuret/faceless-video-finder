
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const FALLBACK_CHANNEL_TYPES = [
  {
    id: "compilation",
    label: "Compilation",
    description: "Videos that compile interesting clips, facts, or moments around a specific theme",
    image_url: null,
    production: "Source clips from stock footage or with proper permissions, edit them together with transitions, add background music and captions",
    example: "Top 10 Movie Scenes, Amazing Animal Moments, Funniest Fails"
  },
  {
    id: "educational",
    label: "Educational",
    description: "Videos that teach viewers about specific topics or skills",
    image_url: null,
    production: "Research thoroughly, create script, use visuals like slides or animations, record clear audio narration",
    example: "How Things Work, Science Explained, History Mysteries"
  },
  {
    id: "data_visualization",
    label: "Data Visualization",
    description: "Videos that present data, statistics, and facts in visually engaging ways",
    image_url: null,
    production: "Research topic thoroughly, create animations using tools like After Effects or Blender, add voiceover narration",
    example: "Country GDP Comparisons, Population Growth Visualized, Climate Change Statistics"
  },
  {
    id: "relaxation",
    label: "Relaxation/Ambient",
    description: "Calming videos with beautiful scenery, sounds, or ambient music to help viewers relax",
    image_url: null,
    production: "Record or source high-quality nature footage, add ambient sounds or gentle music, edit for smooth transitions",
    example: "Thunderstorm Sounds, Fireplace with Crackling Sounds, Ocean Waves"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      throw new Error("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request parameters
    let typeId: string | null = null;
    
    // Parse the request body if this is a POST request
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      typeId = body.typeId || null;
    }
    
    console.log(`Fetching channel types${typeId ? ` for ID: ${typeId}` : ", all types"}`);
    
    // If a specific type ID is requested
    if (typeId) {
      const { data, error } = await supabase
        .from("channel_types")
        .select("id, label, description, image_url, production, example")
        .eq("id", typeId)
        .single();
      
      if (error) {
        console.error("Error fetching specific channel type:", error);
        // Try to find in fallback data
        const fallbackType = FALLBACK_CHANNEL_TYPES.find(type => type.id === typeId);
        if (fallbackType) {
          return new Response(JSON.stringify(fallbackType), {
            headers: { ...corsHeaders },
          });
        }
        throw error;
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders },
      });
    }
    
    // Fetch all channel types
    const { data, error } = await supabase
      .from("channel_types")
      .select("id, label, description, image_url, production, example")
      .order("label");
    
    if (error) {
      console.error("Error fetching channel types:", error);
      // Return fallback data if database query fails
      return new Response(JSON.stringify(FALLBACK_CHANNEL_TYPES), {
        headers: { ...corsHeaders },
      });
    }
    
    if (!data || data.length === 0) {
      console.log("No channel types found, returning fallback data");
      // Return fallback data if no data in database
      return new Response(JSON.stringify(FALLBACK_CHANNEL_TYPES), {
        headers: { ...corsHeaders },
      });
    }
    
    console.log(`Successfully fetched ${data.length} channel types`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in channel types function:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred fetching channel types",
      fallback: FALLBACK_CHANNEL_TYPES 
    }), {
      status: 500,
      headers: { ...corsHeaders },
    });
  }
});
