
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

    const prompt = `Given a YouTube channel titled "${channelTitle}" with video ID "${videoId}", please provide:
    1. A concise but detailed channel description (2-3 sentences)
    2. The most likely niche category for this channel (1-2 words)
    
    Format the response as JSON with "description" and "niche" fields.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a YouTube channel analyst. Provide accurate, professional descriptions.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    let result;
    
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If parsing fails, try to extract information in a more forgiving way
      const content = data.choices[0].message.content;
      result = {
        description: content.match(/description"?: "(.*?)"/i)?.[1] || content.split('\n')[0],
        niche: content.match(/niche"?: "(.*?)"/i)?.[1] || content.split('\n').slice(-1)[0],
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
