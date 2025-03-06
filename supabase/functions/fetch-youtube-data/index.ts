
// Follow Edge Function format exactly
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from './httpHelpers.ts';
import { handleRequest } from './requestHandler.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  return handleRequest(req);
});
