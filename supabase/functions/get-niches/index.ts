
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
    
    // Use a cache-control header for better caching
    const responseHeaders = {
      ...corsHeaders, 
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300" // Cache for 5 minutes
    };
    
    // Get all niches from the database with a shorter timeout (5 seconds)
    const { data: nichesData, error: nichesError } = await Promise.race([
      supabase
        .from('niches')
        .select('id, name, description, image_url')
        .order('name'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Niches query timeout")), 5000)
      )
    ]) as any;
    
    if (nichesError) {
      console.error("Error fetching niches:", nichesError);
      // Return default niches with error info
      return new Response(
        JSON.stringify({ 
          niches: defaultNiches,
          nicheDetails: {},
          source: "default",
          error: nichesError.message
        }),
        { headers: responseHeaders }
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
        { headers: responseHeaders }
      );
    }
    
    console.log(`Found ${nichesData.length} niches in database`);
    
    // Get niche details with a shorter timeout (3 seconds)
    let nicheDetailsData = [];
    try {
      const { data: details, error: detailsError } = await Promise.race([
        supabase
          .from('niche_details')
          .select('niche_id, content'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Niche details query timeout")), 3000)
        )
      ]) as any;
      
      if (!detailsError && details) {
        nicheDetailsData = details;
      } else {
        console.warn("Error fetching niche details:", detailsError);
      }
    } catch (detailsError) {
      console.warn("Failed to fetch niche details:", detailsError);
      // Continue without details
    }
    
    // Create a map of niche IDs to details
    const nicheDetailsMap = {};
    
    if (nicheDetailsData.length > 0) {
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

    console.log(`Returning ${niches.length} niches with details`);
    
    return new Response(
      JSON.stringify({ 
        niches,
        nicheDetails,
        source: "database",
        count: niches.length
      }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Exception getting niches:", error);
    
    // Return default niches with error info and cache for less time
    return new Response(
      JSON.stringify({ 
        niches: defaultNiches,
        nicheDetails: {},
        source: "default",
        error: error.message || "An error occurred while fetching niches",
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60" // Cache errors for only 1 minute
        } 
      }
    );
  }
});
