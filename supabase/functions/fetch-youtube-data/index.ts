
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './httpHelpers.ts';
import { handleRequest } from './requestHandler.ts';

// Add a command to log startup
console.log(`[${new Date().toISOString()}] 🚀 fetch-youtube-data edge function starting up`);

serve(async (req) => {
  // Add more detailed logging for diagnostics
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📥 Request received: ${req.method} ${req.url}`);
  
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
      console.log(`[${timestamp}] ⚠️ Safety timeout triggered, aborting request`);
      controller.abort();
    }, 9000); // 9 seconds, significantly below Supabase's ~12s limit
    
    try {
      // Process the actual request with our improved handler
      const result = await Promise.race([
        handleRequest(req),
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => {
            reject(new Error('Request aborted by safety timeout'));
          });
        })
      ]);
      
      clearTimeout(timeoutId);
      return result;
    } catch (handlerError) {
      clearTimeout(timeoutId);
      console.error(`[${timestamp}] 🚨 Handler error:`, handlerError);
      
      return new Response(
        JSON.stringify({ 
          error: "Function timed out",
          message: handlerError.message || "Request processing exceeded time limit",
          success: false,
          timestamp: timestamp,
          // Add flag to indicate the client should use mock data
          useMockData: true
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
        timestamp: new Date().toISOString(),
        // Add flag to indicate the client should use mock data
        useMockData: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
