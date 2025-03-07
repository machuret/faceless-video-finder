
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request received in fetch-channel-stats function');
    
    // Parse request
    const { channelUrl, fetchDescriptionOnly } = await req.json()

    if (!channelUrl) {
      console.error('Missing channelUrl parameter');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Channel URL is required' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`Fetching ${fetchDescriptionOnly ? 'about section' : 'stats'} for channel: ${channelUrl}`);

    // This is a placeholder for actual YouTube API integration
    // In a real implementation, you would use the YouTube API to fetch channel stats
    // For now, we'll simulate the response
    
    // Extract useful information from the URL (if it's a valid YouTube channel URL)
    let channelId = "";
    if (channelUrl.includes('youtube.com/channel/')) {
      channelId = channelUrl.split('youtube.com/channel/')[1].split('?')[0];
    } else if (channelUrl.includes('youtube.com/user/')) {
      channelId = channelUrl.split('youtube.com/user/')[1].split('?')[0];
    } else if (channelUrl.includes('youtube.com/@')) {
      channelId = channelUrl.split('youtube.com/@')[1].split('?')[0];
    }
    
    console.log(`Extracted channel ID: ${channelId}`);
    
    // Mock data - in a real implementation, this would come from the YouTube API
    const mockDescription = "This is a sample YouTube channel description fetched by our API. " +
      "This channel is focused on creating content about technology, gaming, and lifestyle. " +
      "We post new videos every week and strive to deliver high-quality content for our viewers. " +
      "Join our community to stay updated with the latest trends and tips!";
      
    const mockStats = {
      subscriberCount: 100000 + Math.floor(Math.random() * 900000),
      viewCount: 5000000 + Math.floor(Math.random() * 5000000),
      videoCount: 50 + Math.floor(Math.random() * 150),
      title: channelId ? `Channel: ${channelId}` : "Sample YouTube Channel",
      description: mockDescription,
      startDate: "2018-01-15", // Ensure we're providing a start date in YYYY-MM-DD format
      country: "US" // Add country code
    };
    
    // If we're only fetching the description, return a simplified response
    if (fetchDescriptionOnly) {
      console.log('Returning mock description');
      return new Response(
        JSON.stringify({ 
          success: true, 
          description: mockDescription
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    console.log('Returning mock stats with start date and country:', mockStats);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...mockStats 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in fetch-channel-stats function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
