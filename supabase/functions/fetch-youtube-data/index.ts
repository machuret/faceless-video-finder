
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './httpHelpers.ts';
import { handleRequest } from './requestHandler.ts';

// Add startup message for easier debugging
console.log(`🚀 fetch-youtube-data edge function starting up - ${new Date().toISOString()}`);

serve(async (req) => {
  // Add detailed logging timestamp
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] Request received: ${req.method} ${req.url}`);
  
  // Handle CORS preflight quickly
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Simple guard against timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error(`⏱️ [${timestamp}] Edge function timeout reached`);
        reject(new Error('Edge function timeout'));
      }, 9000); // 9 second timeout
    });
    
    // Process the request with timeout protection
    try {
      const response = await Promise.race([
        handleRequest(req),
        timeoutPromise
      ]);
      return response;
    } catch (error) {
      console.error(`⚠️ [${timestamp}] Error or timeout:`, error.message);
      
      // Return a clean error response
      return new Response(
        JSON.stringify({ 
          error: error.message || "Unknown error occurred",
          success: false,
          timestamp
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    // Global error handler as a safety net
    console.error(`🚨 [${timestamp}] Critical error:`, error.message);
    return new Response(
      JSON.stringify({ 
        error: "Critical server error",
        message: error.message || "Unknown error",
        success: false,
        timestamp
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
