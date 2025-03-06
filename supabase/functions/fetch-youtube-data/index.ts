
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './httpHelpers.ts';
import { handleRequest } from './requestHandler.ts';

serve(async (req) => {
  // Add more detailed logging for diagnostics
  console.log(`[${new Date().toISOString()}] 📥 Request received: ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      console.log('[CORS] Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    // Process the actual request with our improved handler
    return await handleRequest(req);
  } catch (error) {
    // Global error catch to ensure we always return a response
    console.error(`[${new Date().toISOString()}] 🚨 Unhandled global error:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message || "Unknown error",
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
