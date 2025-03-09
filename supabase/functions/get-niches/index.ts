
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { niches as defaultNiches } from "../_shared/niches.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all niches from the database
    const { data: nichesData, error: nichesError } = await supabase
      .from("niches")
      .select("*");
      
    if (nichesError) {
      throw nichesError;
    }
    
    // Get all niche details from the database
    const { data: nicheDetailsRecords, error: detailsError } = await supabase
      .from("niche_details")
      .select("*");
      
    if (detailsError) {
      throw detailsError;
    }
    
    // Check if we have niches in the database
    const niches = nichesData.length > 0 
      ? nichesData.map(niche => niche.name) 
      : defaultNiches;
    
    // Convert array of niche details to a record for easier access
    const nicheDetails = nicheDetailsRecords.reduce((acc, detail) => {
      // Find the corresponding niche for this detail
      const niche = nichesData.find(n => n.id === detail.niche_id);
      
      if (niche) {
        acc[niche.name] = {
          name: niche.name,
          description: niche.description,
          example: detail.content
        };
      }
      return acc;
    }, {});

    return new Response(
      JSON.stringify({ 
        niches: niches,
        nicheDetails
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching niches:", error);
    
    // Return the default niches list if there's an error
    return new Response(
      JSON.stringify({ 
        niches: defaultNiches,
        nicheDetails: {},
        error: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
