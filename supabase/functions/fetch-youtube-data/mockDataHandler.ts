
import { createMockChannelData } from './mockData.ts';
import { createSuccessResponse } from './httpHelpers.ts';

/**
 * Handles mock data responses for test requests or when explicitly requested
 */
export function handleMockDataRequest(url: string, attemptNumber: number, timestamp: string) {
  console.log(`[${timestamp}] 🧪 Using mock data for URL: ${url} (attempt: ${attemptNumber})`);
  const mockData = createMockChannelData(url);
  return createSuccessResponse({ 
    channelData: mockData,
    isMockData: true,
    extractionMethod: "mock",
    attempt: attemptNumber
  }, timestamp);
}

/**
 * Handles test ping requests
 */
export function handleTestRequest(requestTimestamp: string, timestamp: string) {
  console.log(`[${timestamp}] 🧪 Test request received with timestamp: ${requestTimestamp}`);
  return createSuccessResponse({ 
    message: "Edge function is working correctly", 
    receivedAt: timestamp,
    requestTimestamp
  }, timestamp);
}

/**
 * Handles fallback to mock data when all extraction methods fail
 */
export function handleExtractionFailure(url: string, error: string, timestamp: string) {
  console.log(`[${timestamp}] ⚠️ All extraction methods failed, returning mock data`);
  const mockData = createMockChannelData(url);
  return createSuccessResponse({ 
    channelData: mockData, 
    isMockData: true,
    extractionMethod: "mock_fallback",
    error
  }, timestamp);
}
