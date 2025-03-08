
import { ChannelStatsResponse } from "supabase/functions/fetch-channel-stats-apify/types";
import { RequiredFieldDefinition } from "./types";

/**
 * Required fields that a channel should have
 */
export const REQUIRED_FIELDS: RequiredFieldDefinition[] = [
  { key: 'subscriberCount', label: 'Total Subscribers' },
  { key: 'viewCount', label: 'Total Views' },
  { key: 'videoCount', label: 'Video Count' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'description', label: 'Description' },
  { key: 'country', label: 'Country' }
];

/**
 * Verifies which required fields are missing from the data
 */
export const verifyRequiredFields = (data: ChannelStatsResponse): string[] => {
  const missing = REQUIRED_FIELDS.filter(field => {
    const value = data[field.key];
    return !value || value === "0" || String(value).trim() === "";
  });
  
  return missing.map(field => field.label);
};
