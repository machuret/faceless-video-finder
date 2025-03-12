
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { cors } from "../_shared/cors.ts";
import { getPublicChannels } from "../_shared/public-channels.ts";

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return cors(req);
  }
  
  try {
    // Get parameters from the request
    const { limit, offset } = await req.json();
    
    // Call the shared function to get public channels
    const result = await getPublicChannels(req, { 
      limit: Number(limit) || 10, 
      offset: Number(offset) || 0 
    });
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      cors(req, {
        status: result.error ? 400 : 200,
        headers: { "Content-Type": "application/json" }
      })
    );
  } catch (error) {
    console.error("Error in get-public-channels function:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      cors(req, {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    );
  }
});
