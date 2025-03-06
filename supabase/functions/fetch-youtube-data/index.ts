
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './httpHelpers.ts';
import { handleRequest } from './requestHandler.ts';

// Add a command to log startup
console.log(`[${new Date().toISOString()}] 🚀 fetch-youtube-data edge function starting up`);

serve(async (req) => {
  // Add more detailed logging for diagnostics
  console.log(`[${new Date().toISOString()}] 📥 Request received: ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight quickly to avoid wasting resources
    if (req.method === 'OPTIONS') {
      console.log('[CORS] Handling OPTIONS request');
      return new Response(null, { headers: corsHeaders });
    }

    // Use AbortController to ensure we always get a response within the time limit
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set a generous but not too long timeout to ensure a response
    // This is a safety net in case requestHandler internal timeouts fail
    const timeoutId = setTimeout(() => {
      console.log(`[${new Date().toISOString()}] ⚠️ Safety timeout triggered, aborting request`);
      controller.abort();
    }, 11000); // 11 seconds, just below Supabase's ~12s limit
    
    try {
      // Process the actual request with our improved handler
      const responsePromise = handleRequest(req);
      
      // Race the handler against an abort - this should be redundant with
      // the handler's internal timeouts, but provides an extra safety net
      const response = await Promise.race([
        responsePromise,
        new Promise<Response>((_, reject) => {
          signal.addEventListener('abort', () => {
            reject(new Error('Request aborted by safety timeout'));
          });
        })
      ]);
      
      clearTimeout(timeoutId);
      return response;
    } catch (handlerError) {
      clearTimeout(timeoutId);
      console.error(`[${new Date().toISOString()}] 🚨 Handler error:`, handlerError);
      
      return new Response(
        JSON.stringify({ 
          error: "Function timed out",
          message: handlerError.message || "Request processing exceeded time limit",
          success: false,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    // Global error catch to ensure we always return a response
    console.error(`[${new Date().toISOString()}] 🚨 Unhandled global error:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message || "Unknown error",
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
