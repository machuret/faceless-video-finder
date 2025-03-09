
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as fs from "https://deno.land/std@0.168.0/fs/mod.ts";
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
    
    // Extract the niches array from content
    const nichesMatch = content.match(/export const niches = \[([\s\S]*?)\]\.sort\(\);/);
    if (!nichesMatch || !nichesMatch[1]) {
      throw new Error("Could not parse niches file");
    }
    
    let nichesContent = nichesMatch[1];
    
    // Check if niche already exists (case-insensitive)
    const currentNiches = nichesContent
      .split(',')
      .map(n => n.trim())
      .filter(n => n.startsWith('"') || n.startsWith("'"))
      .map(n => n.replace(/['"]/g, '').trim());
    
    if (currentNiches.some(n => n.toLowerCase() === niche.toLowerCase())) {
      throw new Error("Niche already exists");
    }
    
    // Add new niche
    const updatedNichesContent = nichesContent + `  "${niche}",\n`;
    
    // Create new file content
    const updatedContent = content.replace(
      /export const niches = \[([\s\S]*?)\]\.sort\(\);/,
      `export const niches = [\n${updatedNichesContent}].sort();`
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
