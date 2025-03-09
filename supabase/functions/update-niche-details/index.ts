
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, description, example, image_url } = await req.json();

    if (!niche || typeof niche !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing niche name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = supabaseClient(req);
    
    // Find niche by name
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
    
    // First update the niche's image_url
    const { error: updateImageError } = await supabase
      .from('niches')
      .update({ 
        description: description, 
        image_url: image_url
      })
      .eq('id', nicheData.id);
    
    if (updateImageError) {
      throw updateImageError;
    }
    
    // Now update or insert the niche description details
    const { data: nicheDetailsData, error: detailsError } = await supabase
      .from('niche_details')
      .select()
      .eq('niche_id', nicheData.id)
      .maybeSingle();
    
    let updateResult;
    
    if (nicheDetailsData) {
      // Update existing record
      updateResult = await supabase
        .from('niche_details')
        .update({ content: example || null })
        .eq('id', nicheDetailsData.id);
    } else if (example) {
      // Insert new record
      updateResult = await supabase
        .from('niche_details')
        .insert({ niche_id: nicheData.id, content: example });
    }
    
    if (updateResult?.error) {
      throw updateResult.error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Updated details for "${niche}"` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating niche details:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while updating the niche details",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
