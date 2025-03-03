
// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

const getChannelTypeFromOpenAI = async (title: string, description: string) => {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }

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

    const cleanDescription = description ? description.replace(/<\/?[^>]+(>|$)/g, "") : "";

    const prompt = `
      Analyze this YouTube channel and determine the most likely channel type from the provided list.
      
      Channel Title: ${title}
      Channel Description: ${cleanDescription || "No description provided"}
      
      Available Channel Types: 
      ${channelTypes.join(", ")}
      
      Respond with only one channel type from the list.
    `;

    console.log("Sending request to OpenAI");
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI response:", data);
    
    const channelType = data.choices[0].message.content.trim().toLowerCase();
    
    // Validate that the returned type is in our list
    if (channelTypes.includes(channelType)) {
      return channelType;
    } else {
      // If not an exact match, find the closest match in our list
      for (const type of channelTypes) {
        if (channelType.includes(type)) {
          return type;
        }
      }
      // Default fallback
      return "other";
    }
  } catch (error) {
    console.error("Error getting channel type from OpenAI:", error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Only process POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the request body
    const { title, description } = await req.json();

    if (!title) {
      return new Response(JSON.stringify({ error: 'Channel title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Processing channel type generation for:", { title, description });

    // Get channel type from OpenAI
    const channelType = await getChannelTypeFromOpenAI(title, description || "");

    // Return the result
    return new Response(JSON.stringify({ channelType }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in generate-channel-type function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
