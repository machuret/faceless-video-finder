
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { supabaseClient } from "../_shared/supabaseClient.ts";
import { ensureStorageBucketsExist } from "../_shared/createStorageBuckets.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = supabaseClient(req);
    
    // Ensure storage buckets exist using the imported function
    await ensureStorageBucketsExist(supabase);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage buckets initialized successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error initializing storage:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while initializing storage",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
