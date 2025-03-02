
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { label, description } = await req.json();
    
    if (!label) {
      throw new Error('Label is required');
    }

    console.log(`Enhancing description for: ${label}`);
    console.log(`Original description: ${description || 'None'}`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
    }

    // Call OpenAI API to enhance the description
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
            content: 'You are an expert in YouTube content creation strategies, particularly faceless content. Your task is to enhance descriptions of faceless YouTube content ideas to be more comprehensive, educational, and valuable for content creators. Include key points about the concept, potential audience, and why this format is effective. Format the response as plain text with paragraphs. DO NOT use markdown, HTML tags, or code blocks in your response.'
          },
          { 
            role: 'user', 
            content: `Please enhance the description for this faceless YouTube content idea: "${label}". ${description ? `Current description: ${description}` : "There is no existing description."}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log("OpenAI API response received");
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Unexpected API response format:", data);
      throw new Error('Unexpected response from OpenAI');
    }
    
    const enhancedDescription = data.choices[0].message.content;
    console.log("Enhanced description created successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      enhancedDescription 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error enhancing description:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
