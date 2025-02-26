
import { corsHeaders } from '../_shared/cors.ts';

interface YouTubeResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
      };
      customUrl?: string;
    };
    statistics: {
      viewCount: string;
      subscriberCount: string;
    };
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    // Extract video ID or channel ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu.be\/)([^&\n?#]+)/);
    const channelIdMatch = url.match(/(?:youtube\.com\/)(?:channel\/|c\/)([^&\n?#]+)/);
    
    if (!videoIdMatch && !channelIdMatch) {
      throw new Error('Invalid YouTube URL');
    }

    const videoId = videoIdMatch?.[1];
    let channelId;

    // If we have a video ID, first get the channel ID from the video
    if (videoId) {
      const videoResponse = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${Deno.env.get('YOUTUBE_API_KEY')}`
      );
      const videoData = await videoResponse.json();
      channelId = videoData.items?.[0]?.snippet?.channelId;
      if (!channelId) throw new Error('Could not find channel ID');
    } else {
      channelId = channelIdMatch![1];
    }

    // Get channel details
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${Deno.env.get('YOUTUBE_API_KEY')}`
    );

    const data: YouTubeResponse = await response.json();
    
    if (!data.items?.[0]) {
      throw new Error('Channel not found');
    }

    const channel = data.items[0];
    const channelData = {
      video_id: videoId || '',
      channel_title: channel.snippet.title,
      channel_url: `https://youtube.com/channel/${channel.id}`,
      description: channel.snippet.description,
      screenshot_url: channel.snippet.thumbnails.default.url,
      total_subscribers: parseInt(channel.statistics.subscriberCount),
      total_views: parseInt(channel.statistics.viewCount),
    };

    return new Response(JSON.stringify(channelData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
