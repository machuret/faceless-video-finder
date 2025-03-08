
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
  
  // Return validated data
  return {
    isValid: true,
    data: {
      channelId: body.channelId,
      channelUrl: body.channelUrl
    }
  };
}
