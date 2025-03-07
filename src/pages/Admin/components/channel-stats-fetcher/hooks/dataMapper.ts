
import { ChannelFormData } from "@/types/forms";
import { ChannelStatsResponse } from "supabase/functions/fetch-channel-stats-apify/types";
import { FieldMapping, ProcessedChannelData } from "./types";
import { verifyRequiredFields } from "./dataValidator";

/**
 * Maps API fields to form field names
 */
export const FIELD_MAPPINGS: FieldMapping = {
  description: 'description',
  country: 'country',
  subscriberCount: 'total_subscribers',
  viewCount: 'total_views',
  videoCount: 'video_count',
  startDate: 'start_date',
  title: 'channel_title'
};

/**
 * Maps API response data to form data format
 */
export const mapResponseToFormData = (
  data: ChannelStatsResponse
): ProcessedChannelData => {
  const missing = verifyRequiredFields(data);
  const hasPartialData = missing.length > 0;
  
  // Transform API data to form data format
  const stats: Partial<ChannelFormData> = {
    total_subscribers: data.subscriberCount?.toString() || "",
    total_views: data.viewCount?.toString() || "",
    video_count: data.videoCount?.toString() || "",
    description: data.description || "",
    channel_title: data.title || "",
    start_date: data.startDate || "",
    country: data.country || ""
  };

  return {
    stats,
    missing,
    hasPartialData
  };
};

/**
 * Maps partial API response data to form data
 * Specifically for missing fields fetch operation
 */
export const mapPartialResponseToFormData = (
  data: ChannelStatsResponse,
  missingFields: string[]
): { partialStats: Partial<ChannelFormData>; successfulFields: string[]; failedFields: string[] } => {
  const partialStats: Partial<ChannelFormData> = {};
  const successfulFields: string[] = [];
  const failedFields: string[] = [];
  
  // Check each field in the response and add to our stats object if present
  Object.entries(FIELD_MAPPINGS).forEach(([apiField, formField]) => {
    const responseField = apiField as keyof ChannelStatsResponse;
    if (data[responseField] !== undefined && 
        data[responseField] !== null && 
        String(data[responseField]).trim() !== "") {
      // Use explicit string conversion for all values to ensure proper typing
      if (typeof formField === 'string') {
        partialStats[formField as keyof ChannelFormData] = String(data[responseField]) as any;
        successfulFields.push(apiField);
      }
    } else if (missingFields.some(field => field.toLowerCase().includes(apiField.toLowerCase()))) {
      failedFields.push(apiField);
    }
  });
  
  return { partialStats, successfulFields, failedFields };
};
