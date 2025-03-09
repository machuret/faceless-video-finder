
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
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all niche details from the database
    const { data: nicheDetailsRecords, error } = await supabase
      .from("niche_details")
      .select("*");
      
    if (error) {
      throw error;
    }
    
    // Convert array of niche details to a record for easier access
    const nicheDetails = nicheDetailsRecords.reduce((acc, niche) => {
      acc[niche.name] = {
        name: niche.name,
        description: niche.description,
        example: niche.example
      };
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
        niches: niches,
        nicheDetails: {},
        error: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
