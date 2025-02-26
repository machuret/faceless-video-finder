
import { corsHeaders } from '../_shared/cors.ts';

interface YouTubeResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        default: { url: string };
      };
      customUrl?: string;
    };
    statistics: {
      viewCount: string;
      subscriberCount: string;
      videoCount: string;
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
    
    // Extract channel ID from URL - support more URL formats
    const channelIdPatterns = [
      /youtube\.com\/channel\/([^\/\?\&]+)/,      // /channel/ID
      /youtube\.com\/c\/([^\/\?\&]+)/,            // /c/custom-name
      /youtube\.com\/@([^\/\?\&]+)/,              // /@username
      /youtube\.com\/user\/([^\/\?\&]+)/          // /user/username (legacy)
    ];

    let channelId = null;
    
    // Try to find channel ID from URL patterns
    for (const pattern of channelIdPatterns) {
      const match = url.match(pattern);
      if (match) {
        channelId = match[1];
        break;
      }
    }

    // If no channel ID found directly, try to get it from video
    if (!channelId) {
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu.be\/)([^&\n?#]+)/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const videoResponse = await fetch(
          `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${Deno.env.get('YOUTUBE_API_KEY')}`
        );
        const videoData = await videoResponse.json();
        channelId = videoData.items?.[0]?.snippet?.channelId;
      }
    }

    if (!channelId) {
      throw new Error('Could not extract channel ID from URL');
    }

    // Get channel details with statistics
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${Deno.env.get('YOUTUBE_API_KEY')}`
    );

    const data: YouTubeResponse = await response.json();
    
    if (!data.items?.[0]) {
      throw new Error('Channel not found');
    }

    const channel = data.items[0];
    const channelData = {
      video_id: channelId, // Use channel ID as video_id since it's required
      channel_title: channel.snippet.title,
      channel_url: `https://youtube.com/channel/${channelId}`,
      description: channel.snippet.description,
      screenshot_url: channel.snippet.thumbnails.default.url,
      total_subscribers: parseInt(channel.statistics.subscriberCount),
      total_views: parseInt(channel.statistics.viewCount),
      start_date: new Date(channel.snippet.publishedAt).toISOString().split('T')[0],
      video_count: parseInt(channel.statistics.videoCount),
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
