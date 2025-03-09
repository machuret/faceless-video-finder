
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

// Cache control settings for better performance
const CACHE_CONTROL = 'public, max-age=300, s-maxage=600';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function called: get-channel-types");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 3000)
    );
    
    // Make efficient query with only needed fields
    const queryPromise = supabase
      .from('channel_types')
      .select('id, label, description')
      .order('label');

    const { data: channelTypes, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Error fetching channel types:', error);
      throw error;
    }

    console.log(`Retrieved ${channelTypes?.length || 0} channel types from database`);

    // Return the channel types with cache headers
    const response = {
      channelTypes: channelTypes || [],
      success: true,
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': CACHE_CONTROL
      },
    });
  } catch (error) {
    console.error('Error in get-channel-types function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
