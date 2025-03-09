
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as path from "https://deno.land/std@0.168.0/path/mod.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { niche } = await req.json();
    
    if (!niche || typeof niche !== 'string') {
      throw new Error("Invalid niche provided");
    }
    
    // Read current niches file
    const nichesFilePath = path.join(Deno.cwd(), "../_shared/niches.ts");
    const content = await Deno.readTextFile(nichesFilePath);
    
    // Remove the niche from the content
    const updatedContent = content.replace(
      new RegExp(`\\s*["']${niche}["'],?\\n?`), 
      ""
    );
    
    // Write back to file
    await Deno.writeTextFile(nichesFilePath, updatedContent);
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
