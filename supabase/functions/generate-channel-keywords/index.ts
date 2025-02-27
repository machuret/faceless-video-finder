
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { title, description, category } = await req.json();

    if (!title) {
      throw new Error('Channel title is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Generate exactly 10 relevant keywords for a YouTube channel. Return ONLY a JSON array of lowercase strings.'
          },
          {
            role: 'user',
            content: `Generate 10 SEO keywords for this YouTube channel:
              Title: ${title}
              Description: ${description || 'No description provided'}
              Category: ${category || 'other'}
              
              Return only a JSON array of lowercase strings, nothing else.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate keywords');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let keywords;
    try {
      keywords = JSON.parse(data.choices[0].message.content);
      if (!Array.isArray(keywords)) {
        throw new Error('Invalid keywords format');
      }
      keywords = keywords.slice(0, 10); // Ensure exactly 10 keywords
    } catch (e) {
      console.error('Failed to parse keywords:', e);
      throw new Error('Failed to parse keywords response');
    }
    
    return new Response(JSON.stringify({ keywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-channel-keywords:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
