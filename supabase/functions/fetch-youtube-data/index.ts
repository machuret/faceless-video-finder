
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './httpHelpers.ts';
import { handleRequest } from './requestHandler.ts';

// Add startup message for easier debugging
console.log(`🚀 fetch-youtube-data edge function starting up - ${new Date().toISOString()}`);

serve(async (req) => {
  // Add detailed logging timestamp
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] DEBUG: Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight quickly
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] [CORS] DEBUG: Handling OPTIONS request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${timestamp}] DEBUG: Processing ${req.method} request`);
    // Process the request with no timeout protection for debugging
    try {
      const response = await handleRequest(req);
      console.log(`[${timestamp}] DEBUG: Request successfully processed`);
      return response;
    } catch (error) {
      console.error(`[${timestamp}] ⚠️ DEBUG: Error in request handling:`, error.message, error.stack);
      
      // Return a clean error response
      return new Response(
        JSON.stringify({ 
          error: error.message || "Unknown error occurred",
          success: false,
          timestamp,
          debug: "Edge function caught error"
        }),
        { 
          status: 200, // Use 200 to ensure we see the response
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    // Global error handler as a safety net
    console.error(`[${timestamp}] 🚨 DEBUG: Critical error:`, error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: "Critical server error",
        message: error.message || "Unknown error",
        success: false,
        timestamp,
        debug: "Edge function global catch"
      }),
      { 
        status: 200, // Use 200 to ensure we see the response
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
