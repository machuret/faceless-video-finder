
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
    console.log('Handling OPTIONS request for CORS preflight');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request received in fetch-channel-stats-apify function');
    
    // Parse request
    const { channelUrl, fetchDescriptionOnly } = await req.json();

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

    // Get Apify API token from environment variable
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_KEY") || Deno.env.get("APIFY_API_TOKEN");
    
    if (!APIFY_API_TOKEN) {
      console.error('Apify API token not configured');
      return provideMockData(channelUrl, fetchDescriptionOnly, corsHeaders, "Apify API token not configured");
    }

    try {
      // Determine if URL is for a channel or search term
      const url = normalizeYouTubeUrl(channelUrl);
      console.log(`Normalized URL: ${url}`);
      
      // Call Apify API to run the YouTube Scraper actor
      const actorRunResponse = await fetchFromApify(url, APIFY_API_TOKEN);
      console.log("Apify response received");
      
      if (!actorRunResponse || actorRunResponse.error) {
        console.error('Error from Apify:', actorRunResponse?.error || 'No response');
        return provideMockData(
          channelUrl, 
          fetchDescriptionOnly, 
          corsHeaders, 
          actorRunResponse?.error || 'Error fetching data from Apify'
        );
      }
      
      // If we're only fetching the description
      if (fetchDescriptionOnly) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            description: actorRunResponse.channelDescription || "", 
            source: "apify"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
      
      // Format the complete response
      const channelStats = {
        success: true,
        subscriberCount: actorRunResponse.numberOfSubscribers || 0,
        viewCount: parseInt(actorRunResponse.channelTotalViews?.replace(/,/g, '') || "0") || 0,
        videoCount: actorRunResponse.channelTotalVideos || 0,
        title: actorRunResponse.channelName || "",
        description: actorRunResponse.channelDescription || "",
        startDate: formatDate(actorRunResponse.channelJoinedDate) || "",
        country: actorRunResponse.channelLocation || "",
        source: "apify"
      };
      
      console.log('Returning channel stats:', channelStats);
      
      return new Response(
        JSON.stringify(channelStats),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } catch (error) {
      console.error('Error processing channel data:', error);
      
      // More descriptive error for mock data fallback
      const errorReason = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log(`API processing failed (${errorReason}), falling back to mock data`);
      
      // Fall back to mock data if API fails
      return provideMockData(channelUrl, fetchDescriptionOnly, corsHeaders, errorReason);
    }
    
  } catch (error) {
    console.error('Error in fetch-channel-stats-apify function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

/**
 * Normalizes a YouTube URL or search term
 */
function normalizeYouTubeUrl(input: string): string {
  // If it's a full URL, return it
  if (input.includes('youtube.com/') || input.includes('youtu.be/')) {
    // Make sure it has about page for channel URLs to get full info
    if (input.includes('/channel/') && !input.includes('/about')) {
      return `${input.replace(/\/$/, '')}/about`;
    }
    // For handle URLs, add about section
    if (input.includes('/@') && !input.includes('/about')) {
      return `${input.replace(/\/$/, '')}/about`;
    }
    return input;
  }
  
  // If it's a handle (starts with @), convert to full URL
  if (input.startsWith('@')) {
    return `https://www.youtube.com/${input}/about`;
  }
  
  // If it looks like a channel ID (starts with UC)
  if (/^UC[\w-]{21,24}$/.test(input)) {
    return `https://www.youtube.com/channel/${input}/about`;
  }
  
  // Otherwise treat as a search term
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
}

/**
 * Fetches channel data from Apify YouTube Scraper
 */
async function fetchFromApify(url: string, apiToken: string) {
  console.log(`Calling Apify YouTube Scraper for URL: ${url}`);
  
  // Start a run of the YouTube Scraper actor
  const startResponse = await fetch('https://api.apify.com/v2/actor-tasks/apify~youtube-scraper/runs?token=' + apiToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "startUrls": [{ "url": url }],
      "maxVideos": 1,
      "proxy": {
        "useApifyProxy": true
      },
      "maxResults": 1
    })
  });
  
  if (!startResponse.ok) {
    throw new Error(`Failed to start Apify task: ${startResponse.status} ${startResponse.statusText}`);
  }
  
  const startData = await startResponse.json();
  const runId = startData.data.id;
  console.log(`Apify run started with ID: ${runId}`);
  
  // Wait for the run to finish
  let isFinished = false;
  let attempts = 0;
  const maxAttempts = 30;  // 30 attempts with 2s delay = max 60s wait
  
  while (!isFinished && attempts < maxAttempts) {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 2000));  // 2 second delay
    
    const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`);
    if (!statusResponse.ok) {
      console.warn(`Failed to get run status, attempt ${attempts}: ${statusResponse.status}`);
      continue;
    }
    
    const statusData = await statusResponse.json();
    console.log(`Run status: ${statusData.data.status}, attempt ${attempts}`);
    
    if (['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(statusData.data.status)) {
      isFinished = true;
      
      if (statusData.data.status !== 'SUCCEEDED') {
        throw new Error(`Apify run failed with status: ${statusData.data.status}`);
      }
    }
  }
  
  if (!isFinished) {
    throw new Error(`Apify run did not complete in time (${maxAttempts} attempts)`);
  }
  
  // Get the dataset items
  const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`);
  if (!datasetResponse.ok) {
    throw new Error(`Failed to get dataset: ${datasetResponse.status} ${datasetResponse.statusText}`);
  }
  
  const datasetItems = await datasetResponse.json();
  console.log(`Retrieved ${datasetItems.length} items from dataset`);
  
  if (!datasetItems || datasetItems.length === 0) {
    throw new Error('No data returned from Apify');
  }
  
  // Return the first item
  return datasetItems[0];
}

// Helper function to provide mock data when real data can't be fetched
function provideMockData(channelUrl: string, fetchDescriptionOnly: boolean, corsHeaders: any, errorReason = "API error") {
  console.log(`Providing mock data for: ${channelUrl} (Reason: ${errorReason})`);
  
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
        is_mock: true,
        error_reason: errorReason,
        source: "mock"
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
    is_mock: true,
    error_reason: errorReason,
    source: "mock"
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
    // Handle Apify date format, e.g., "Mar 18, 2015"
    const parts = dateString.split(', ');
    if (parts.length === 2) {
      const monthDay = parts[0].split(' ');
      const year = parts[1];
      
      if (monthDay.length === 2) {
        const monthMap: {[key: string]: string} = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
          'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
          'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        
        const month = monthMap[monthDay[0]];
        const day = monthDay[1].padStart(2, '0');
        
        if (month && day) {
          return `${year}-${month}-${day}`;
        }
      }
    }
    
    // Fallback to ISO date parsing
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
