
import { APIFY_API_TOKEN } from "../../_shared/screenshot-utils.ts";

export { APIFY_API_TOKEN };
export const APIFY_BASE_URL = "https://api.apify.com/v2";
// Use the new Ultimate Scraping Actor ID instead of the previous one
export const APIFY_ACTOR_ID = "FU5kPkREa2rdypuqb";
export const MAX_POLLING_ATTEMPTS = 90; // Increased from 60 to 90 - Allow up to 3 minutes
export const POLLING_INTERVAL_MS = 2000;

export function validateApiToken(): { isValid: boolean; error?: string } {
  if (!APIFY_API_TOKEN) {
    console.error("APIFY_API_TOKEN is not defined");
    return { 
      isValid: false, 
      error: "Missing API token for screenshot service" 
    };
  }
  return { isValid: true };
}
