
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
              content: 'You are an expert in YouTube content creation strategies, particularly faceless content. Your analysis should be detailed, professional, and focused on how this type of channel works from a faceless content creation perspective.'
            },
            {
              role: 'user',
              content: `Based on the title and information available for this YouTube channel: "${channelTitle}", analyze the channel and explain how this type of YouTube channel is built from a FACELESS point of view. Include:
              
              1. A brief overview of what this type of channel entails
              2. The production process for creating faceless content in this niche
              3. The pros and cons of running this type of faceless channel
              4. Key success factors for this type of content
              
              Write as an expert, illustrating the analysis of this niche/channel specifically from a faceless content creation perspective. Provide practical insights that would be valuable to someone considering starting a similar channel.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
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

      // Get the description from the response
      const description = data.choices[0].message.content.trim();
      console.log('Generated description:', description);

      // Return the AI-generated description
      return new Response(JSON.stringify({
        description: description,
        niche: channelTitle.split(' ')[0] // Simple niche extraction for demo purposes
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
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
