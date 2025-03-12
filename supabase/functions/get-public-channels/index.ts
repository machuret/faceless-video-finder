
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { url, key } = getSupabaseCredentials();
    const supabase = createClient(url, key);
    
    // Get request parameters
    const requestData = await req.json();
    
    const {
      limit = 50,
      offset = 0,
      countOnly = false,
      missingScreenshot = false,
      missingType = false,
      missingStats = false,
      missingKeywords = false,
      hasStats = false,
      featured = false,
      fields = [], // Support for field selection
    } = requestData;
    
    console.log("Request parameters:", { 
      limit, offset, countOnly, featured,
      fields: fields.length > 0 ? fields.join(',') : 'all',
      filters: { missingScreenshot, missingType, missingStats, missingKeywords, hasStats }
    });
    
    // Build the query based on parameters
    // Determine select fields - performance optimization
    let selectClause = '*';
    if (fields && Array.isArray(fields) && fields.length > 0) {
      // Ensure id is always included for referential integrity
      if (!fields.includes('id')) {
        fields.push('id');
      }
      selectClause = fields.join(',');
    } else if (countOnly) {
      // When just counting, only select id
      selectClause = 'id';
    }
    
    let query = supabase.from('youtube_channels').select(
      selectClause,
      countOnly ? { count: 'exact', head: true } : { count: 'exact' }
    );
    
    // Apply filters based on parameters
    if (missingScreenshot) {
      query = query.is('screenshot_url', null);
    }
    
    if (missingType) {
      query = query.or('channel_type.is.null,channel_type.eq.other');
    }
    
    if (missingStats) {
      query = query.or('total_subscribers.is.null,total_views.is.null,video_count.is.null');
    }
    
    if (missingKeywords) {
      query = query.or('keywords.is.null,keywords.eq.{}');
    }
    
    if (hasStats) {
      query = query.not('video_count', 'is', null);
    }
    
    if (featured) {
      query = query.eq('is_featured', true);
    }
    
    // Always sort by creation date descending
    query = query.order('created_at', { ascending: false });
    
    // If just counting, return the count
    if (countOnly) {
      const { count, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return new Response(JSON.stringify({ totalCount: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Otherwise get the actual data with pagination
    const { data, count, error } = await query.range(offset, offset + limit - 1);
    
    if (error) {
      throw error;
    }
    
    // Add cache-control header for better client caching
    const responseHeaders = {
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=60, s-maxage=120' // 1 minute client, 2 minutes CDN
    };
    
    return new Response(
      JSON.stringify({
        channels: data || [],
        totalCount: count,
      }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Error in get-public-channels function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper to get Supabase credentials from environment variables
function getSupabaseCredentials() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  
  return { url, key };
}
