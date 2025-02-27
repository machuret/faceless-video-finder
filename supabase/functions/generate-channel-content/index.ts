
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { channelTitle } = await req.json();
    console.log('Received request for channel:', channelTitle);

    // Test 1: Verify API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    // Test 2: Verify input
    if (!channelTitle) {
      console.error('No channel title provided');
      throw new Error('Channel title is required');
    }

    // Test 3: API call with proper formatting
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Generate a JSON object with a description and niche for the YouTube channel "${channelTitle}". Use this exact format:
{
  "description": "(2-3 sentences about the channel)",
  "niche": "(1-2 word category)"
}`,
        max_tokens: 200,
        temperature: 0.7,
        n: 1
      }),
    });

    // Test 4: Verify API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    console.log('Raw OpenAI response:', data);

    if (!data.choices?.[0]?.text) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }

    // Test 5: Parse and validate response
    try {
      const parsedResult = JSON.parse(data.choices[0].text.trim());
      console.log('Parsed result:', parsedResult);

      if (!parsedResult.description || !parsedResult.niche) {
        throw new Error('Missing required fields in response');
      }

      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw text:', data.choices[0].text);
      
      // Fallback: Create a structured response even if parsing fails
      const fallbackResponse = {
        description: data.choices[0].text.split('\n')[0] || 'Description unavailable',
        niche: 'General'
      };
      
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
