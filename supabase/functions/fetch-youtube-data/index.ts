
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Create Supabase client
const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || ''
);

serve(async (req) => {
  console.log('Edge Function: fetch-youtube-data invoked');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { url } = requestData;

    if (!url) {
      throw new Error('URL is required');
    }

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured');
    }

    console.log(`Processing URL: ${url}`);
    
    // Extract channel ID or handle from URL
    const channelInfo = await extractChannelInfo(url);
    
    if (!channelInfo) {
      throw new Error('Could not extract channel information from URL');
    }
    
    // Get channel details
    const channelData = await fetchChannelData(channelInfo);
    
    console.log('Successfully fetched channel data');
    
    // Merge the data and return it
    const responseData = {
      ...channelInfo,
      ...channelData
    };
    
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

// Function to extract channel ID or handle from URL
async function extractChannelInfo(url: string) {
  console.log(`Extracting channel info from: ${url}`);
  
  let channelId = '';
  let videoId = '';
  let handle = '';
  let queryType = '';
  
  // Extract video ID from watch URL
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (videoMatch && videoMatch[1]) {
    videoId = videoMatch[1];
    queryType = 'video';
    console.log(`Extracted video ID: ${videoId}`);
  }
  
  // Extract channel ID from channel URL
  const channelMatch = url.match(/(?:youtube\.com\/(?:channel\/|c\/)|youtube\.com\/@)([^\/\s?]+)/);
  if (channelMatch && channelMatch[1]) {
    if (channelMatch[0].includes('@')) {
      handle = channelMatch[1];
      queryType = 'handle';
      console.log(`Extracted channel handle: ${handle}`);
    } else {
      channelId = channelMatch[1];
      queryType = 'channel';
      console.log(`Extracted channel ID: ${channelId}`);
    }
  }
  
  // If it's just a handle with no youtube.com
  if (!channelId && !videoId && !handle && url.startsWith('@')) {
    handle = url.substring(1);
    queryType = 'handle';
    console.log(`Extracted raw handle: ${handle}`);
  }
  
  // If we have a video ID, get the channel ID from the video
  if (videoId) {
    console.log(`Fetching channel ID for video: ${videoId}`);
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    const videoData = await videoResponse.json();
    
    if (videoData.items && videoData.items.length > 0) {
      channelId = videoData.items[0].snippet.channelId;
      console.log(`Found channel ID from video: ${channelId}`);
    } else {
      throw new Error('Video not found or invalid video ID');
    }
  }
  
  // If we have a handle but no channel ID, get the channel ID from the handle
  if (handle && !channelId) {
    console.log(`Fetching channel ID for handle: ${handle}`);
    const handleUrl = handle.startsWith('@') ? handle : `@${handle}`;
    
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handleUrl)}&type=channel&key=${YOUTUBE_API_KEY}`
    );
    
    const channelData = await channelResponse.json();
    
    if (channelData.items && channelData.items.length > 0) {
      channelId = channelData.items[0].id.channelId;
      console.log(`Found channel ID from handle: ${channelId}`);
    } else {
      throw new Error('Channel not found or invalid handle');
    }
  }
  
  if (!channelId) {
    throw new Error('Could not extract channel ID from the URL');
  }
  
  return { 
    channelId,
    queryType,
    channelUrl: `https://www.youtube.com/channel/${channelId}`
  };
}

// Function to fetch channel data
async function fetchChannelData(channelInfo: { channelId: string }) {
  console.log(`Fetching data for channel ID: ${channelInfo.channelId}`);
  
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelInfo.channelId}&key=${YOUTUBE_API_KEY}`
  );
  
  const channelData = await channelResponse.json();
  
  if (!channelData.items || channelData.items.length === 0) {
    throw new Error('Channel not found or invalid channel ID');
  }
  
  const channel = channelData.items[0];
  
  console.log(`Successfully fetched data for channel: ${channel.snippet.title}`);
  
  // Return formatted channel data
  return {
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails.high.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount, 10),
    viewCount: parseInt(channel.statistics.viewCount, 10),
    videoCount: parseInt(channel.statistics.videoCount, 10),
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country || null
  };
}
