
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { supabaseClient } from "../_shared/supabaseClient.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche } = await req.json();

    if (!niche || typeof niche !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing niche name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = supabaseClient(req);
    
    // Insert into the niches table
    const { data, error } = await supabase
      .from('niches')
      .insert({ name: niche })
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: `Niche "${niche}" added successfully`, niche: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error adding niche:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while adding the niche",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
