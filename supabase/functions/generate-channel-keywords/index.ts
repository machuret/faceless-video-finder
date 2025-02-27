
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
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { title, description, category } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Channel title is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Calling OpenAI API with:', { title, description, category });

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
            content: 'You are a YouTube SEO expert. Your task is to generate exactly 10 relevant keywords for a YouTube channel. You must respond with ONLY a raw JSON array of lowercase strings without any markdown formatting, explanation, or additional text. Example correct response: ["keyword1","keyword2","keyword3"]'
          },
          {
            role: 'user',
            content: `Channel Title: ${title}
Description: ${description || 'No description provided'}
Category: ${category || 'other'}

Remember: Return ONLY a raw JSON array of 10 lowercase keywords. No other text or formatting.`
          }
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate keywords from OpenAI' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      return new Response(
        JSON.stringify({ error: 'Invalid response format from OpenAI' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let keywords;
    try {
      const content = data.choices[0].message.content.trim();
      console.log('Raw content:', content);
      keywords = JSON.parse(content);
      
      if (!Array.isArray(keywords)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure we have exactly 10 keywords
      keywords = keywords.slice(0, 10);
      
      console.log('Generated keywords:', keywords);
      
      return new Response(
        JSON.stringify({ keywords }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Failed to parse keywords:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse keywords response',
          details: error instanceof Error ? error.message : 'Unknown parsing error',
          rawContent: data.choices[0].message.content
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error in generate-channel-keywords:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
