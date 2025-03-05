
export interface RequestBody {
  channelUrl: string;
  channelId: string;
}

export function validateRequestBody(body: any): { 
  isValid: boolean; 
  error?: string; 
  data?: RequestBody 
} {
  try {
    const { channelUrl, channelId } = body as RequestBody;

    // Validate input
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
    return { 
      isValid: false, 
      error: `Invalid request body: ${error.message}`
    };
  }
}
