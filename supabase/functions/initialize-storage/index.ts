
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient, clearQueryCache } from "../_shared/supabaseClient.ts";
import { ensureStorageBucketsExist } from "../_shared/createStorageBuckets.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[initialize-storage] Starting storage bucket initialization");
    
    // Initialize client with advanced options
    const supabase = supabaseClient(req, {
      cacheResults: true,
      auditLog: true
    });
    
    // Ensure all storage buckets exist
    await ensureStorageBucketsExist(supabase);
    
    // Clear cache to ensure fresh state
    const clearedItems = clearQueryCache();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage buckets initialized successfully",
        cacheCleared: clearedItems
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error initializing storage buckets:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An error occurred initializing storage buckets" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
