
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
    
    // Find the niche by name first
    const { data: nicheData, error: findError } = await supabase
      .from('niches')
      .select('id')
      .eq('name', niche)
      .single();
    
    if (findError) {
      return new Response(
        JSON.stringify({ error: `Niche "${niche}" not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete niche from the database
    const { error: deleteError } = await supabase
      .from('niches')
      .delete()
      .eq('id', nicheData.id);
    
    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true, message: `Niche "${niche}" deleted successfully` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting niche:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while deleting the niche",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
