
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";
import { niches as defaultNiches } from "../_shared/niches.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("get-niches function called");
    const supabase = supabaseClient(req);
    
    // Get all niches from the database
    const { data: nichesData, error: nichesError } = await supabase
      .from('niches')
      .select('id, name, description, image_url')
      .order('name');
    
    if (nichesError) {
      console.error("Error fetching niches:", nichesError);
      // Fall back to default niches array if database query fails
      return new Response(
        JSON.stringify({ 
          niches: defaultNiches,
          nicheDetails: {},
          source: "default",
          error: nichesError.message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!nichesData || nichesData.length === 0) {
      console.log("No niches found in database, returning default list");
      return new Response(
        JSON.stringify({ 
          niches: defaultNiches,
          nicheDetails: {},
          source: "default",
          message: "No niches found in database"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${nichesData.length} niches in database`);
    
    // Get niche details
    const { data: nicheDetailsData, error: detailsError } = await supabase
      .from('niche_details')
      .select('niche_id, content');
    
    if (detailsError) {
      console.error("Error fetching niche details:", detailsError);
      // Continue with niches but without details
    }
    
    // Create a map of niche IDs to details
    const nicheDetailsMap = {};
    
    if (nicheDetailsData) {
      nicheDetailsData.forEach(detail => {
        if (detail.niche_id) {
          nicheDetailsMap[detail.niche_id] = detail.content;
        }
      });
    }
    
    // Create an array of niche names and a map of name to details
    const niches = nichesData.map(niche => niche.name);
    const nicheDetails = {};
    
    nichesData.forEach(niche => {
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
        nicheDetails,
        source: "database",
        count: niches.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Exception getting niches:", error);
    
    // Fall back to default niches if there's an exception
    return new Response(
      JSON.stringify({ 
        niches: defaultNiches,
        nicheDetails: {},
        source: "default",
        error: error.message || "An error occurred while fetching niches",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
