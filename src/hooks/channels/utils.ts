
/**
 * Since we're now fetching video stats separately and combining them with channels in the API,
 * we no longer need most of these utility functions. Keeping this file minimal to avoid type issues.
 */

// Kept only for backward compatibility, but no longer used
export const processRawChannelsData = (rawData: any[]): any[] => {
  return rawData || [];
};
