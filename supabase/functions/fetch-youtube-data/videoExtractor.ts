
import { fetchFromYouTubeAPI } from './apiUtils.ts';
import { fetchChannelData } from './directExtractor.ts';

/**
 * Extract channel data via a video URL
 */
export async function fetchChannelViaVideo(url: string, YOUTUBE_API_KEY: string) {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Attempting to fetch channel via video URL: ${url}`);
  
  // Extract video ID
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?\/#]+)/i);
  if (!videoMatch || !videoMatch[1]) {
    console.error(`❌ [${timestamp}] Could not extract video ID`);
    throw new Error('Could not extract video ID');
  }
  
  const videoId = videoMatch[1];
  console.log(`🔹 [${timestamp}] Extracted video ID: ${videoId}`);
  
  // Get channel ID from video
  const videoData = await fetchFromYouTubeAPI(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`,
    timestamp
  );
  
  if (!videoData.items || videoData.items.length === 0) {
    console.error(`❌ [${timestamp}] Video not found or invalid video ID`);
    throw new Error('Video not found or invalid video ID');
  }
  
  const channelId = videoData.items[0].snippet.channelId;
  console.log(`🔹 [${timestamp}] Found channel ID from video: ${channelId}`);
  
  // Use the shared function to get channel details
  return await fetchChannelData(channelId, YOUTUBE_API_KEY, timestamp);
}
