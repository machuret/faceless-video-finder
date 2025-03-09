
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = supabaseClient(req);
    
    // Get all niches from the database
    const { data: nichesData, error: nichesError } = await supabase
      .from('niches')
      .select('id, name, description, image_url')
      .order('name');
    
    if (nichesError) {
      throw nichesError;
    }
    
    // Get niche details
    const { data: nicheDetailsData, error: detailsError } = await supabase
      .from('niche_details')
      .select('niche_id, content');
    
    if (detailsError) {
      throw detailsError;
    }
    
    // Create a map of niche IDs to details
    const nicheDetailsMap = {};
    
    nicheDetailsData?.forEach(detail => {
      if (detail.niche_id) {
        nicheDetailsMap[detail.niche_id] = detail.content;
      }
    });
    
    // Create an array of niche names and a map of name to details
    const niches = nichesData?.map(niche => niche.name) || [];
    const nicheDetails = {};
    
    nichesData?.forEach(niche => {
      nicheDetails[niche.name] = {
        name: niche.name,
        description: niche.description,
        example: nicheDetailsMap[niche.id] || null,
        image_url: niche.image_url
      };
    });

    return new Response(
      JSON.stringify({ 
        niches,
        nicheDetails
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting niches:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while fetching niches",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
