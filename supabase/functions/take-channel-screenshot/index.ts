
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Get request parameters
    const { channelId, channelUrl } = await req.json();
    
    if (!channelId || !channelUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters: channelId and channelUrl are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`Taking screenshot for channel: ${channelId} (${channelUrl})`);
    
    // Ensure the URL is properly formatted
    let formattedUrl = channelUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Use the screenshot API to get a screenshot
    const apiKey = Deno.env.get("SCREENSHOT_API_KEY");
    if (!apiKey) {
      throw new Error("SCREENSHOT_API_KEY environment variable is not set");
    }
    
    const screenshotApiUrl = `https://api.screenshotmachine.com/?key=${apiKey}&url=${encodeURIComponent(formattedUrl)}&dimension=1366x768&format=jpg&cacheLimit=0&delay=1000`;
    
    // Fetch the screenshot
    const response = await fetch(screenshotApiUrl);
    if (!response.ok) {
      throw new Error(`Screenshot API error: ${response.status} ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    
    // Upload to Supabase storage
    const { url, key } = getSupabaseCredentials();
    const supabase = createClient(url, key);
    
    const timestamp = new Date().getTime();
    const filename = `channel-screenshots/${channelId}_${timestamp}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public')
      .upload(filename, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (uploadError) {
      throw new Error(`Error uploading screenshot: ${uploadError.message}`);
    }
    
    // Get the public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('public')
      .getPublicUrl(filename);
    
    const screenshotUrl = publicUrlData.publicUrl;
    
    // Update the channel record with the screenshot URL
    const { error: updateError } = await supabase
      .from('youtube_channels')
      .update({ screenshot_url: screenshotUrl })
      .eq('id', channelId);
    
    if (updateError) {
      throw new Error(`Error updating channel: ${updateError.message}`);
    }
    
    console.log(`Successfully updated screenshot for channel ${channelId}: ${screenshotUrl}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        screenshotUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in take-channel-screenshot function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper to get Supabase credentials from environment variables
function getSupabaseCredentials() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  
  return { url, key };
}
