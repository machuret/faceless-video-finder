
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { niche, description, example } = await req.json();

    if (!niche || typeof niche !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid or missing niche name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = supabaseClient(req);
    
    // Find the niche by name
    const { data: nicheData, error: findError } = await supabase
      .from('niches')
      .select('id')
      .eq('name', niche)
      .single();
    
    if (findError) {
      // If niche doesn't exist, create it
      const { data: newNiche, error: createError } = await supabase
        .from('niches')
        .insert({ name: niche, description })
        .select()
        .single();
      
      if (createError) {
        throw createError;
      }
      
      // Create the niche_details record
      if (example) {
        const { error: createDetailError } = await supabase
          .from('niche_details')
          .insert({ 
            niche_id: newNiche.id, 
            content: example 
          });
        
        if (createDetailError) {
          throw createDetailError;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Niche "${niche}" created with details` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update the niche description
    const { error: updateError } = await supabase
      .from('niches')
      .update({ description })
      .eq('id', nicheData.id);
    
    if (updateError) {
      throw updateError;
    }
    
    // Check if niche_details exists
    const { data: existingDetails, error: checkError } = await supabase
      .from('niche_details')
      .select('id')
      .eq('niche_id', nicheData.id)
      .single();
    
    if (!existingDetails) {
      // Create niche_details if it doesn't exist
      const { error: createDetailError } = await supabase
        .from('niche_details')
        .insert({ 
          niche_id: nicheData.id, 
          content: example 
        });
      
      if (createDetailError) {
        throw createDetailError;
      }
    } else {
      // Update existing niche_details
      const { error: updateDetailError } = await supabase
        .from('niche_details')
        .update({ content: example })
        .eq('id', existingDetails.id);
      
      if (updateDetailError) {
        throw updateDetailError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Niche "${niche}" details updated successfully` 
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
