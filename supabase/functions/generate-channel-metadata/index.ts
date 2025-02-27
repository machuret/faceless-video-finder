
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { countries } from "../_shared/constants.ts";
import { channelTypes } from "../_shared/constants.ts";
import { niches } from "../_shared/constants.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of valid database channel types
const validDatabaseChannelTypes = ["creator", "brand", "media", "other"];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { channelTitle, description, fieldToGenerate } = requestBody;

    if (!channelTitle) {
      return new Response(JSON.stringify({ error: 'Channel title is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!description) {
      return new Response(JSON.stringify({ error: 'Description is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert the channel types to a simplified format for the AI to understand
    const simplifiedChannelTypes = channelTypes.map(type => ({
      id: type.id,
      label: type.label,
      description: type.description.substring(0, 120)
    }));

    let prompt;
    let fieldName;

    // Create a specific prompt based on the requested field
    if (fieldToGenerate === 'niche') {
      fieldName = 'niche';
      prompt = `
As an AI YouTube channel analyst, analyze the following YouTube channel:

Channel Title: ${channelTitle}
Channel Description: ${description}

Based on this information, determine the most appropriate niche from these options: ${niches.join(', ')}

Return only the niche name, nothing else.
`;
    } else if (fieldToGenerate === 'country') {
      fieldName = 'country';
      prompt = `
As an AI YouTube channel analyst, analyze the following YouTube channel:

Channel Title: ${channelTitle}
Channel Description: ${description}

Based on this information, determine the most likely country of origin from these options: ${countries.join(', ')}

Return only the country name, nothing else.
`;
    } else if (fieldToGenerate === 'channelType') {
      fieldName = 'channelType';
      prompt = `
As an AI YouTube channel analyst, analyze the following YouTube channel:

Channel Title: ${channelTitle}
Channel Description: ${description}

Based on this information, determine the most appropriate type of faceless channel from these options: ${simplifiedChannelTypes.map(type => `${type.id} (${type.label})`).join(', ')}

Return only the channel type ID (not the label), nothing else.
`;
    } else {
      // Default: generate all fields
      prompt = `
As an AI YouTube channel analyst, analyze the following YouTube channel:

Channel Title: ${channelTitle}
Channel Description: ${description}

Based on this information, please determine the most likely:

1. Niche: Choose the most appropriate niche from these options: ${niches.join(', ')}
2. Country of Origin: Choose the most likely country from these options: ${countries.join(', ')}
3. Type of Faceless Channel: Choose the most appropriate type from these options: ${simplifiedChannelTypes.map(type => `${type.id} (${type.label})`).join(', ')}

Return your answers in JSON format with these fields:
- niche: The niche that best fits this channel
- country: The most likely country of origin
- channelType: The ID of the channel type that best fits this channel (use the ID from the list provided)

For example:
{
  "niche": "Gaming",
  "country": "United States",
  "channelType": "compilation_montage"
}

Only return the JSON, no other text.
`;
    }

    console.log(`Sending prompt to OpenAI for ${fieldToGenerate || 'all fields'} generation`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a YouTube channel analysis expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid response from OpenAI:", data);
      throw new Error("Failed to get valid response from OpenAI");
    }

    const aiResponse = data.choices[0].message.content;
    console.log("AI Response:", aiResponse);

    // Handle single field response
    if (fieldToGenerate) {
      let fieldValue = aiResponse.trim();
      
      // If we're generating channel type, make sure it's valid
      if (fieldToGenerate === 'channelType') {
        const validChannelType = channelTypes.find(type => type.id === fieldValue);
        if (!validChannelType) {
          console.warn(`Channel type '${fieldValue}' not found, using 'other' instead`);
          fieldValue = 'other';
        }
      }
      
      // For niche, make sure it's in our list or at least sensible
      if (fieldToGenerate === 'niche' && !niches.includes(fieldValue)) {
        console.warn(`Niche '${fieldValue}' not found in predefined list, using as-is`);
      }
      
      // For country, make sure it's in our list or at least sensible
      if (fieldToGenerate === 'country' && !countries.includes(fieldValue)) {
        console.warn(`Country '${fieldValue}' not found in predefined list, using as-is`);
      }
      
      // Return just the requested field
      const result = { [fieldName]: fieldValue };
      console.log(`Returning single field result:`, result);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Handle full metadata response
    let metadata;
    try {
      metadata = JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", e);
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          metadata = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error("Failed to extract JSON from AI response:", e2);
          throw new Error("Failed to parse AI response");
        }
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    // Validate the metadata
    if (!metadata.niche || !metadata.country || !metadata.channelType) {
      console.error("Incomplete metadata from AI:", metadata);
      throw new Error("AI generated incomplete metadata");
    }

    // Verify that the niche exists in our list
    if (!niches.includes(metadata.niche)) {
      console.warn(`Niche '${metadata.niche}' not found in predefined list, using as-is`);
    }

    // Verify that the country exists in our list
    if (!countries.includes(metadata.country)) {
      console.warn(`Country '${metadata.country}' not found in predefined list, using as-is`);
    }

    // Verify that the channel type exists in our list
    const validChannelType = channelTypes.find(type => type.id === metadata.channelType);
    if (!validChannelType) {
      console.warn(`Channel type '${metadata.channelType}' not found, using 'other' instead`);
      metadata.channelType = 'other';
    }

    console.log(`Final metadata being returned: `, metadata);
    
    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-channel-metadata function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
