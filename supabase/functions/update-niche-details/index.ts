
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { niches } from "../_shared/niches.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { niche, description, example } = await req.json();

    if (!niche || typeof niche !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid niche name" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this niche exists in our list
    const existingNiches = [...niches];
    if (!existingNiches.includes(niche)) {
      return new Response(
        JSON.stringify({ success: false, error: "Niche not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Store the niche details in the metadata JSON object in our niches table
    // First check if we have a record for this niche
    const { data: existingRecord, error: fetchError } = await supabase
      .from("niche_details")
      .select("*")
      .eq("name", niche)
      .single();
    
    let updateResult;
    
    if (existingRecord) {
      // Update existing record
      updateResult = await supabase
        .from("niche_details")
        .update({
          description,
          example,
          updated_at: new Date().toISOString()
        })
        .eq("name", niche);
    } else {
      // Insert new record
      updateResult = await supabase
        .from("niche_details")
        .insert({
          name: niche,
          description,
          example
        });
    }
    
    if (updateResult.error) {
      throw updateResult.error;
    }

    return new Response(
      JSON.stringify({ success: true, message: `Updated details for "${niche}"` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating niche details:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
