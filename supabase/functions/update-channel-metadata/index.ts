
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseClient } from '../_shared/supabaseClient.ts'

interface RequestParams {
  channelId: string;
  metadata: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request
    const { channelId, metadata } = await req.json() as RequestParams

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!metadata) {
      return new Response(
        JSON.stringify({ error: 'Metadata is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get a Supabase client
    const supabase = supabaseClient(req)

    // Perform a raw update query to update the metadata JSONB field
    const { data, error } = await supabase.rpc('update_channel_metadata', {
      channel_id: channelId,
      metadata_json: JSON.stringify(metadata)
    })

    if (error) {
      console.error('Error updating channel metadata:', error)
      
      // Fallback to a direct update if RPC fails
      const { error: directError } = await supabase
        .from('youtube_channels')
        .update({ 
          metadata: metadata 
        })
        .eq('id', channelId)

      if (directError) {
        console.error('Direct update also failed:', directError)
        throw directError
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
