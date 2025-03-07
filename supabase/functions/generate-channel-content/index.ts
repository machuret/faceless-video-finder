
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
    // Log request
    console.log('Request received:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    });

    const requestData = await req.json();
    const { channelTitle } = requestData;
    console.log('Channel title:', channelTitle);

    // Check OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key is not set');
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('API key found (length):', openAIApiKey.length);

    // Validate input
    if (!channelTitle) {
      console.error('No channel title provided in request');
      return new Response(JSON.stringify({
        error: 'Channel title is required',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test OpenAI API connection
    console.log('Making OpenAI API request...');
    try {
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
              content: 'You are a YouTube channel analyzer. Provide analysis in JSON format only.'
            },
            {
              role: 'user',
              content: `Analyze this YouTube channel: "${channelTitle}". Respond ONLY with a JSON object in this exact format:
              {
                "description": "2-3 sentences about the channel",
                "niche": "1-2 words describing the category"
              }`
            }
          ]
        }),
      });

      console.log('OpenAI API Response Status:', response.status);
      console.log('OpenAI API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error Response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI API Response Data:', JSON.stringify(data, null, 2));

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid OpenAI response structure:', data);
        throw new Error('Invalid response structure from OpenAI');
      }

      // Parse response
      const content = data.choices[0].message.content.trim();
      console.log('Raw content:', content);

      try {
        const parsed = JSON.parse(content);
        console.log('Parsed content:', parsed);

        if (!parsed.description || !parsed.niche) {
          throw new Error('Missing required fields in parsed response');
        }

        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Failed to parse content:', content);
        throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
      }
    } catch (openAiError) {
      console.error('OpenAI API Error:', openAiError);
      throw new Error(`OpenAI API error: ${openAiError.message}`);
    }
  } catch (error) {
    console.error('General Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return new Response(JSON.stringify({
      error: error.message || 'An unknown error occurred',
      success: false,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
