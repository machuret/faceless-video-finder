
import { RequiredFieldDefinition } from "./types";

/**
 * Required fields for channel stats
 */
export const REQUIRED_FIELDS: RequiredFieldDefinition[] = [
  { key: 'title', label: 'Channel Title' },
  { key: 'subscriberCount', label: 'Subscriber Count' },
  { key: 'viewCount', label: 'View Count' },
  { key: 'videoCount', label: 'Video Count' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'description', label: 'Description' }
];

/**
 * Verifies which required fields are missing from the data
 */
export const verifyRequiredFields = (data: any): string[] => {
  const missing = REQUIRED_FIELDS.filter(field => {
    const value = data[field.key];
    return !value || value === "0" || String(value).trim() === "";
  });
  
  return missing.map(field => field.label);
};
