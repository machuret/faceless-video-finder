
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

// Cache control settings
const CACHE_CONTROL = 'public, max-age=300, s-maxage=600';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function called: get-niches");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use more efficient query with proper indexing
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 3000)
    );
    
    const queryPromise = supabase
      .from('niches')
      .select('name, description, image_url')
      .order('name');
    
    const { data: nichesData, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Error fetching niches:', error);
      throw error;
    }

    // Process the data efficiently
    const niches = [];
    const nicheDetails = {};
    
    if (nichesData && nichesData.length > 0) {
      console.log(`Retrieved ${nichesData.length} niches from database`);
      
      // Process in a single loop for efficiency
      for (const niche of nichesData) {
        niches.push(niche.name);
        nicheDetails[niche.name] = {
          name: niche.name,
          description: niche.description,
          example: null,
          image_url: niche.image_url
        };
      }
    }
    
    // Add cache headers for better performance
    const responseHeaders = { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': CACHE_CONTROL
    };
    
    return new Response(JSON.stringify({
      niches,
      nicheDetails,
      success: true,
    }), {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error in get-niches function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
