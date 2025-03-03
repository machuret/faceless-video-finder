
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.1";

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
    const { title, description } = await req.json();

    if (!title) {
      throw new Error('Channel title is required');
    }

    console.log(`Generating channel type for: "${title}"`);

    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Create the prompt for the AI model
    const prompt = `
      Based on the following YouTube channel information, determine the most appropriate channel type from the list below.
      
      Channel Title: ${title}
      ${description ? `Channel Description: ${description}` : ''}
      
      Available Channel Types (pick exactly one that is the best match):
      - compilation_montage: Compilations or montages of existing content
      - no_face_reaction: React content without showing the creator's face
      - documentary_story: Documentary-style storytelling
      - whiteboard_explainer: Educational content using whiteboard animations
      - animation_2d_3d: 2D or 3D animated content
      - text_based_narrative: Content driven by text overlays
      - screen_recording_tutorial: Tutorials that show screen recordings
      - asmr_ambient: ASMR or ambient sound/visual content
      - news_aggregation: Aggregating and presenting news
      - stock_footage_voiceover: Content using stock footage with voiceover
      - text_to_speech: Content that uses text-to-speech technology
      - infographic_data: Data visualization and infographics
      - hands_only_demo: Demonstrations showing only hands
      - audio_only_podcast: Podcast content with static image
      - music_curation: Music compilations or playlists
      - ai_generated: AI-generated content
      - original_storytelling: Original narrative content
      - history_educational: Historical or educational content
      - fake_trailers: Fan-made or fake movie/game trailers
      - movie_tv_analysis: Analysis of movies, TV shows, or entertainment
      - police_cam_commentary: Commentary on police footage
      - court_reactions: Reactions or analysis of court proceedings
      - live_drama_freakouts: Compilations of dramatic real-life situations
      - virtual_avatar: Content featuring virtual avatars
      - found_footage_archival: Content using found or archival footage
      - other: None of the above fits well
      
      Return only the most appropriate channel type ID as a single word (no explanations).
    `;

    console.log("Sending request to OpenAI");
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more efficient model for simple classification
        messages: [
          { role: 'system', content: 'You are a YouTube channel classifier. Answer with a single channel type ID, no other text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2, // Low temperature for more consistent results
        max_tokens: 20, // Short response needed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the channel type from the response
    const generatedType = data.choices[0].message.content.trim().toLowerCase();
    console.log(`Generated channel type: ${generatedType}`);

    // Validate the generated type matches one of our expected values
    const validTypes = [
      "compilation_montage", "no_face_reaction", "documentary_story", "whiteboard_explainer",
      "animation_2d_3d", "text_based_narrative", "screen_recording_tutorial", "asmr_ambient",
      "news_aggregation", "stock_footage_voiceover", "text_to_speech", "infographic_data",
      "hands_only_demo", "audio_only_podcast", "music_curation", "ai_generated",
      "original_storytelling", "history_educational", "fake_trailers", "movie_tv_analysis",
      "police_cam_commentary", "court_reactions", "live_drama_freakouts", "virtual_avatar",
      "found_footage_archival", "other"
    ];

    // Default to "other" if the generated type is not in our list
    const channelType = validTypes.includes(generatedType) ? generatedType : "other";

    return new Response(
      JSON.stringify({ channelType }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in generate-channel-type function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
