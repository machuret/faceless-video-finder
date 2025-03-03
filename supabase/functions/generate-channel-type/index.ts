
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Set up CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function called: generate-channel-type");
    
    // Get OpenAI API key from environment
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body));
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { title, description } = body;
    
    if (!title) {
      console.error("Missing required field: title");
      return new Response(
        JSON.stringify({ error: "Missing required field: title" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing request for channel: ${title}`);
    
    // List of available channel types
    const channelTypes = [
      "compilation_montage",
      "no_face_reaction",
      "documentary_story",
      "whiteboard_explainer",
      "animation_2d_3d",
      "text_based_narrative",
      "screen_recording_tutorial",
      "asmr_ambient",
      "news_aggregation",
      "stock_footage_voiceover",
      "text_to_speech",
      "infographic_data",
      "hands_only_demo",
      "audio_only_podcast",
      "music_curation",
      "ai_generated",
      "original_storytelling",
      "history_educational",
      "fake_trailers",
      "movie_tv_analysis",
      "police_cam_commentary",
      "court_reactions",
      "live_drama_freakouts",
      "virtual_avatar",
      "found_footage_archival"
    ];

    // Clean description and remove HTML tags
    const cleanDescription = description ? description.replace(/<\/?[^>]+(>|$)/g, "") : "";
    // Limit description length to avoid token limits
    const truncatedDescription = cleanDescription ? cleanDescription.substring(0, 1000) : "No description provided";

    const prompt = `
      Analyze this YouTube channel and determine the most likely channel type from the provided list.
      
      Channel Title: ${title}
      Channel Description: ${truncatedDescription}
      
      Available Channel Types: 
      ${channelTypes.join(", ")}
      
      Return only one channel type from the list that best matches this channel.
      Format your response as a single word or phrase from the list, nothing else.
    `;

    console.log("Sending request to OpenAI");
    
    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 100
      })
    });
    
    // Process OpenAI response
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", openAIResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openAIResponse.status}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const openAIData = await openAIResponse.json();
    console.log("OpenAI response:", JSON.stringify(openAIData));
    
    // Extract channel type from response
    const channelType = openAIData.choices[0]?.message?.content.trim();
    
    if (!channelType) {
      console.error("No channel type found in OpenAI response");
      return new Response(
        JSON.stringify({ error: "Failed to generate channel type" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log(`Generated channel type: ${channelType}`);
    
    // Return the channel type
    return new Response(
      JSON.stringify({ channelType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
