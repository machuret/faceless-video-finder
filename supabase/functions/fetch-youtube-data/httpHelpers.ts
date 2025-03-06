
// Define CORS headers for consistent usage across the application
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Creates a standard error response with consistent formatting
 */
export function createErrorResponse(error: string, status: number = 400, timestamp: string = new Date().toISOString()) {
  console.error(`[${timestamp}] ❌ Error:`, error);
  
  return new Response(
    JSON.stringify({ 
      error,
      timestamp,
      success: false 
    }),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Creates a standard success response with consistent formatting
 */
export function createSuccessResponse(data: any, timestamp: string = new Date().toISOString()) {
  return new Response(
    JSON.stringify({ 
      ...data,
      timestamp,
      success: true 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
