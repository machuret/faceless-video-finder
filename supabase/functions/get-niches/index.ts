
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Direct query with proper timeout protection
    const { data: nichesData, error } = await supabase
      .from('niches')
      .select('name, description, image_url, example, cpm')
      .order('name');

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
          example: niche.example,
          image_url: niche.image_url,
          cpm: niche.cpm
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
    
    // Return a fallback response with default data
    const defaultNiches = [
      "Gaming", "Beauty", "Finance", "Cooking", "Travel",
      "Technology", "Health", "Education", "Entertainment", "Sports"
    ];
    
    const defaultDetails = {};
    defaultNiches.forEach(niche => {
      defaultDetails[niche] = {
        name: niche,
        description: `${niche} content on YouTube`,
        example: null,
        image_url: null,
        cpm: 4
      };
    });
    
    return new Response(JSON.stringify({
      niches: defaultNiches,
      nicheDetails: defaultDetails,
      success: false,
      error: error.message,
      fallback: true
    }), {
      status: 200, // Return 200 with fallback data
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
