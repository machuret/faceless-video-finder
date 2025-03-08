
/**
 * Validates the request body for the take-channel-screenshot function
 */
export function validateRequestBody(requestBody: any): { 
  isValid: boolean; 
  error?: string;
  data?: { channelUrl: string; channelId: string } 
} {
  try {
    // Check if required fields are present
    if (!requestBody) {
      return { isValid: false, error: "Missing request body" };
    }
    
    const { channelUrl, channelId } = requestBody;
    
    if (!channelUrl) {
      return { isValid: false, error: "Channel URL is required" };
    }
    
    if (!channelId) {
      return { isValid: false, error: "Channel ID is required" };
    }
    
    return { 
      isValid: true, 
      data: { channelUrl, channelId }
    };
  } catch (error) {
    console.error("Error validating request body:", error);
    return { 
      isValid: false, 
      error: "Invalid request format" 
    };
  }
}
