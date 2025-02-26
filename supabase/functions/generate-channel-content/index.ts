
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelTitle, videoId } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating content for:', channelTitle, videoId);

    const prompt = `Given a YouTube channel titled "${channelTitle}" with video ID "${videoId}", please provide:
    1. A concise but detailed channel description (2-3 sentences)
    2. The most likely niche category for this channel (1-2 words)
    
    Format the response as a JSON object with exactly these two fields:
    {
      "description": "your description here",
      "niche": "your niche here"
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a YouTube channel analyst. Provide accurate, professional descriptions. Always respond with properly formatted JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate content: ' + error);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let result;
    const content = data.choices[0].message.content;
    
    try {
      result = JSON.parse(content.trim());
      
      // Validate the result has the required fields
      if (!result.description || !result.niche) {
        throw new Error('Missing required fields');
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      console.log('Raw content:', content);
      
      // Fallback parsing method
      const descMatch = content.match(/description"?\s*:\s*"([^"]+)"/);
      const nicheMatch = content.match(/niche"?\s*:\s*"([^"]+)"/);
      
      result = {
        description: descMatch?.[1] || "Description could not be generated",
        niche: nicheMatch?.[1] || "General",
      };
    }

    console.log('Final result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-channel-content function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
