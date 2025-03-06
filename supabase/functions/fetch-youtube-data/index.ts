
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
    // Set a safety timeout to ensure we always get a response
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error(`⏱️ [${timestamp}] Safety timeout reached`);
        reject(new Error('Request timed out'));
      }, 10000); // 10 second timeout
    });
    
    // Race between actual processing and timeout
    return await Promise.race([
      handleRequest(req),
      timeoutPromise.then(() => {
        return new Response(
          JSON.stringify({ 
            error: "Function timed out. Using mock data instead.",
            success: false,
            useMockData: true,
            timestamp
          }),
          { 
            status: 408,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      })
    ]);
  } catch (error) {
    // Global error handler to always return a response
    console.error(`🚨 [${timestamp}] Unhandled error:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error. Using mock data instead.",
        message: error.message || "Unknown error",
        success: false,
        useMockData: true,
        timestamp
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
