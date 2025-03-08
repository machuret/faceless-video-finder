
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../fetch-channel-stats-apify/cors.ts";

// Define the request structure
interface GenerateTypeRequest {
  channelTitle: string;
  description: string;
}

// List of pre-defined channel types
const CHANNEL_TYPES = [
  "face_talking_head",
  "screen_recording_tutorial",
  "commentary_over_gameplay",
  "music_curation",
  "news_aggregation",
  "documentary_story",
  "face_vlog",
  "review_product",
  "explainer",
  "data_visualization",
  "history_educational",
  "fitness_workout",
  "animation",
  "gaming_lets_play",
  "cooking_recipe",
  "comedy_sketch",
  "art_design",
  "travel_vlog",
  "shorts",
  "other"
];

// Utility function to map content to channel type
function determineChannelType(title: string, description: string): string {
  // Convert inputs to lowercase for easier matching
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  // Combine for full text search
  const fullText = `${titleLower} ${descLower}`;
  
  // Match patterns to channel types
  if (descLower.includes("tutorial") || descLower.includes("how to") || 
      descLower.includes("guide") || descLower.includes("learn")) {
    return "screen_recording_tutorial";
  }
  
  if (fullText.includes("gaming") || fullText.includes("gameplay") || 
      fullText.includes("let's play") || fullText.includes("playthrough")) {
    return "gaming_lets_play";
  }
  
  if (fullText.includes("commentary") && (fullText.includes("game") || fullText.includes("gaming"))) {
    return "commentary_over_gameplay";
  }
  
  if (fullText.includes("news") || fullText.includes("updates") || 
      fullText.includes("daily") || fullText.includes("weekly")) {
    return "news_aggregation";
  }
  
  if (fullText.includes("music") || fullText.includes("song") || 
      fullText.includes("playlist") || fullText.includes("album")) {
    return "music_curation";
  }
  
  if (fullText.includes("vlog") || fullText.includes("daily life") || 
      fullText.includes("lifestyle")) {
    return "face_vlog";
  }
  
  if (fullText.includes("travel") || fullText.includes("destination") || 
      fullText.includes("journey") || fullText.includes("explore")) {
    return "travel_vlog";
  }
  
  if (fullText.includes("review") || fullText.includes("unboxing") || 
      fullText.includes("product") || fullText.includes("testing")) {
    return "review_product";
  }
  
  if (fullText.includes("cooking") || fullText.includes("recipe") || 
      fullText.includes("food") || fullText.includes("kitchen")) {
    return "cooking_recipe";
  }
  
  if (fullText.includes("fitness") || fullText.includes("workout") || 
      fullText.includes("exercise") || fullText.includes("training")) {
    return "fitness_workout";
  }
  
  if (fullText.includes("history") || fullText.includes("historical") || 
      fullText.includes("educational") || fullText.includes("education")) {
    return "history_educational";
  }
  
  if (fullText.includes("animation") || fullText.includes("animated") || 
      fullText.includes("cartoon")) {
    return "animation";
  }
  
  if (fullText.includes("comedy") || fullText.includes("funny") || 
      fullText.includes("humor") || fullText.includes("sketch")) {
    return "comedy_sketch";
  }
  
  if (fullText.includes("art") || fullText.includes("design") || 
      fullText.includes("creative") || fullText.includes("drawing")) {
    return "art_design";
  }
  
  if (fullText.includes("explainer") || fullText.includes("explanation") || 
      fullText.includes("explained")) {
    return "explainer";
  }
  
  if (fullText.includes("documentary") || fullText.includes("story") || 
      fullText.includes("stories") || fullText.includes("true story")) {
    return "documentary_story";
  }
  
  if (fullText.includes("talking") || fullText.includes("commentary") || 
      fullText.includes("opinion") || fullText.includes("thoughts")) {
    return "face_talking_head";
  }
  
  if (fullText.includes("data") || fullText.includes("visualization") || 
      fullText.includes("statistics") || fullText.includes("analysis")) {
    return "data_visualization";
  }
  
  if (fullText.includes("shorts") || fullText.includes("short form") || 
      fullText.includes("clip")) {
    return "shorts";
  }
  
  // Default to "other" if no clear match
  return "other";
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData: GenerateTypeRequest = await req.json();
    
    // Validate required fields
    if (!requestData.channelTitle) {
      return new Response(
        JSON.stringify({ error: "Missing required field: channelTitle" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // For debugging
    console.log(`Processing channel type for: ${requestData.channelTitle}`);
    
    // Determine channel type based on title and description
    const channelType = determineChannelType(
      requestData.channelTitle,
      requestData.description || ""
    );
    
    console.log(`Determined channel type: ${channelType}`);
    
    // Return the result
    return new Response(
      JSON.stringify({ 
        success: true, 
        channelType: channelType 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating channel type:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
