
interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: {
    channelId: string;
    channelUrl: string;
  };
}

export function validateRequestBody(body: any): ValidationResult {
  console.log("Validating request body:", body);
  
  // Check if body exists
  if (!body) {
    return { 
      isValid: false, 
      error: "Request body is required" 
    };
  }
  
  // Check if channelId is provided
  if (!body.channelId) {
    return { 
      isValid: false, 
      error: "Channel ID is required" 
    };
  }
  
  // Check if channelUrl is provided
  if (!body.channelUrl) {
    return { 
      isValid: false, 
      error: "Channel URL is required" 
    };
  }
  
  // Validate YouTube URL format
  let channelUrl = body.channelUrl;
  
  // Add https:// if missing
  if (!channelUrl.startsWith('http://') && !channelUrl.startsWith('https://')) {
    channelUrl = `https://${channelUrl}`;
  }
  
  // Check if it's a valid URL
  try {
    new URL(channelUrl);
  } catch (e) {
    return {
      isValid: false,
      error: `Invalid URL: ${channelUrl}`
    };
  }
  
  // Simple validation for YouTube URLs
  const isYouTubeUrl = channelUrl.includes('youtube.com') || 
                      channelUrl.includes('youtu.be') ||
                      (channelUrl.startsWith('https://@') && !channelUrl.includes('.'));
  
  if (!isYouTubeUrl) {
    console.warn(`URL may not be a YouTube channel: ${channelUrl}`);
    // We'll accept it but log a warning
  }
  
  // Return validated data
  return {
    isValid: true,
    data: {
      channelId: body.channelId,
      channelUrl: channelUrl // Return normalized URL
    }
  };
}
