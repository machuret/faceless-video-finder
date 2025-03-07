
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Helper function to extract channel ID from different URL formats
const extractChannelId = (channelUrl: string): string | null => {
  // Handle direct channel IDs
  if (/^UC[\w-]{21,24}$/.test(channelUrl)) {
    return channelUrl;
  }
  
  try {
    // Extract from YouTube URL patterns
    if (channelUrl.includes('youtube.com/channel/')) {
      return channelUrl.split('youtube.com/channel/')[1].split('?')[0].split('/')[0];
    } 
    
    if (channelUrl.includes('youtube.com/@')) {
      return channelUrl.split('youtube.com/@')[1].split('?')[0].split('/')[0];
    }
    
    if (channelUrl.includes('youtube.com/user/')) {
      return channelUrl.split('youtube.com/user/')[1].split('?')[0].split('/')[0];
    }
  } catch (error) {
    console.error('Error extracting channel ID:', error);
  }
  
  return null;
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

    // Extract YouTube channel ID
    const channelId = extractChannelId(channelUrl);
    console.log(`Extracted channel ID: ${channelId}`);
    
    // Use the YouTube Data API to fetch real channel data
    if (channelId) {
      try {
        // This should be stored as an environment variable in production
        const API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"; // Public YouTube API key for demo purposes
        
        // Fetch channel data from YouTube API
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('YouTube API response:', JSON.stringify(data).substring(0, 200) + '...');
        
        // If no channel found in API response
        if (!data.items || data.items.length === 0) {
          console.log('No channel found in YouTube API response');
          
          // Fall back to mock data for demo purposes
          return provideMockData(channelUrl, fetchDescriptionOnly, corsHeaders);
        }
        
        const channel = data.items[0];
        
        // If we're only fetching the description
        if (fetchDescriptionOnly) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              description: channel.snippet.description || "" 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
        
        // Format the complete response
        const channelStats = {
          success: true,
          subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
          viewCount: parseInt(channel.statistics.viewCount) || 0,
          videoCount: parseInt(channel.statistics.videoCount) || 0,
          title: channel.snippet.title || "",
          description: channel.snippet.description || "",
          startDate: formatDate(channel.snippet.publishedAt) || "",
          country: channel.snippet.country || channel.brandingSettings?.channel?.country || ""
        };
        
        console.log('Returning channel stats:', channelStats);
        
        return new Response(
          JSON.stringify(channelStats),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } catch (error) {
        console.error('Error fetching from YouTube API:', error);
        
        // Fall back to mock data if API fails
        return provideMockData(channelUrl, fetchDescriptionOnly, corsHeaders);
      }
    } else {
      console.log('Could not extract channel ID, falling back to mock data');
      return provideMockData(channelUrl, fetchDescriptionOnly, corsHeaders);
    }
    
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

// Helper function to provide mock data when real data can't be fetched
function provideMockData(channelUrl: string, fetchDescriptionOnly: boolean, corsHeaders: any) {
  console.log(`Providing mock data for: ${channelUrl}`);
  
  // Mock description
  const mockDescription = "This is a sample YouTube channel description fetched by our API. " +
    "This channel is focused on creating content about technology, gaming, and lifestyle. " +
    "We post new videos every week and strive to deliver high-quality content for our viewers. " +
    "Join our community to stay updated with the latest trends and tips!";
    
  // If we're only fetching the description
  if (fetchDescriptionOnly) {
    console.log('Returning mock description');
    return new Response(
      JSON.stringify({ 
        success: true, 
        description: mockDescription,
        is_mock: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
  
  // Mock stats with a consistent naming pattern
  const mockStats = {
    success: true,
    subscriberCount: 100000 + Math.floor(Math.random() * 900000),
    viewCount: 5000000 + Math.floor(Math.random() * 5000000),
    videoCount: 50 + Math.floor(Math.random() * 150),
    title: extractTitleFromUrl(channelUrl) || "Sample YouTube Channel",
    description: mockDescription,
    startDate: "2018-01-15",
    country: "US",
    is_mock: true
  };
  
  console.log('Returning mock stats:', mockStats);
  
  return new Response(
    JSON.stringify(mockStats),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  )
}

// Helper to format date to YYYY-MM-DD
function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
}

// Extract title from URL for better mock data
function extractTitleFromUrl(url: string): string {
  if (url.includes('@')) {
    return url.split('@')[1].split('/')[0].split('?')[0].replace(/[-_]/g, ' ');
  }
  
  const lastSegment = url.split('/').pop();
  if (lastSegment) {
    return lastSegment.replace(/[-_]/g, ' ');
  }
  
  return "";
}
