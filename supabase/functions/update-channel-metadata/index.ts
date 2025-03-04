
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
  is_featured?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request received in update-channel-metadata function');
    
    // Parse request
    const { channelId, metadata, is_featured } = await req.json() as RequestParams

    if (!channelId) {
      console.error('Missing channelId parameter');
      return new Response(
        JSON.stringify({ error: 'Channel ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!metadata && is_featured === undefined) {
      console.error('Missing metadata or is_featured parameter');
      return new Response(
        JSON.stringify({ error: 'Either metadata or is_featured is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Updating channel ${channelId}:`, JSON.stringify({ metadata, is_featured }));

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the current metadata to merge with new data if needed
    const { data: currentData, error: fetchError } = await supabase
      .from('youtube_channels')
      .select('metadata')
      .eq('id', channelId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      // Log error but continue with empty metadata if not found
      console.error('Error fetching current metadata:', fetchError);
    }
    
    // Prepare update data
    const updateData: Record<string, any> = {};
    
    // Only include metadata in the update if it was provided
    if (metadata) {
      // Merge existing metadata with new metadata
      const currentMetadata = currentData?.metadata || {};
      updateData.metadata = { ...currentMetadata, ...metadata };
      console.log('Merged metadata:', JSON.stringify(updateData.metadata));
    }
    
    // Include is_featured in the update if it was provided
    if (is_featured !== undefined) {
      updateData.is_featured = is_featured;
      console.log('Setting is_featured to:', is_featured);
    }
    
    // Update the channel
    const { error } = await supabase
      .from('youtube_channels')
      .update(updateData)
      .eq('id', channelId);

    if (error) {
      console.error('Error updating channel:', error);
      throw error;
    } 
      
    console.log('Channel updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Channel updated successfully',
        channelId,
        ...updateData
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
