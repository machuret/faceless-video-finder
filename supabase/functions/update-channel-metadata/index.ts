
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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
    console.log('Request received in update-channel-metadata function');
    
    // Parse request
    const { channelId, metadata } = await req.json() as RequestParams

    if (!channelId) {
      console.error('Missing channelId parameter');
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!metadata) {
      console.error('Missing metadata parameter');
      return new Response(
        JSON.stringify({ error: 'Metadata is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Updating metadata for channel ${channelId}:`, JSON.stringify(metadata));

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current metadata to merge with new data
    const { data: currentData, error: fetchError } = await supabase
      .from('youtube_channels')
      .select('metadata')
      .eq('id', channelId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      // Log error but continue with empty metadata if not found
      console.error('Error fetching current metadata:', fetchError);
    }
    
    // Merge existing metadata with new metadata
    const currentMetadata = currentData?.metadata || {};
    const updatedMetadata = { ...currentMetadata, ...metadata };
    
    console.log('Merged metadata:', JSON.stringify(updatedMetadata));

    // Directly execute a SQL query to update the metadata
    const { error } = await supabase.rpc('update_channel_metadata', {
      channel_id: channelId,
      metadata_json: updatedMetadata
    });

    if (error) {
      console.error('Error calling RPC function:', error);
      
      // Try a direct SQL update as a fallback
      const { error: sqlError } = await supabase.rpc('raw_sql', {
        query: `UPDATE youtube_channels SET metadata = $1::jsonb WHERE id = $2`,
        params: [JSON.stringify(updatedMetadata), channelId]
      });
      
      if (sqlError) {
        console.error('Error with direct SQL update:', sqlError);
        throw sqlError;
      }
      
      console.log('Metadata updated via direct SQL');
    } else {
      console.log('Metadata updated via RPC function');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Metadata updated successfully',
        channelId,
        metadata: updatedMetadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in update-channel-metadata function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
