
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function called: update-niche-details");
    
    // Parse the request body
    const requestData = await req.json();
    const { niche, description, example, image_url } = requestData;
    
    if (!niche) {
      throw new Error('Niche name is required');
    }
    
    console.log(`Updating details for niche: ${niche}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, check if niche exists
    const { data: existingNiche, error: queryError } = await supabase
      .from('niches')
      .select('id')
      .eq('name', niche)
      .maybeSingle();
      
    if (queryError) {
      console.error('Error checking niche existence:', queryError);
      throw new Error(`Database error: ${queryError.message}`);
    }
    
    if (existingNiche) {
      // Update existing niche
      const { error: updateError } = await supabase
        .from('niches')
        .update({
          description,
          image_url
        })
        .eq('name', niche);
        
      if (updateError) {
        throw new Error(`Error updating niche: ${updateError.message}`);
      }
    } else {
      // Create new niche
      const { error: insertError } = await supabase
        .from('niches')
        .insert({
          name: niche,
          description,
          image_url
        });
        
      if (insertError) {
        throw new Error(`Error creating niche: ${insertError.message}`);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully updated details for "${niche}"`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-niche-details function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
