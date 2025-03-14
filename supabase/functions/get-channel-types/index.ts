
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch channel types from database
    const { data: channelTypes, error } = await supabase
      .from('channel_types')
      .select('*')
      .order('label');

    if (error) {
      console.error('Error fetching channel types:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        channelTypes: channelTypes || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-channel-types function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
