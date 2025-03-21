
import type { ChannelSize, UploadFrequency } from "@/types/youtube";

/**
 * Determine the size category of a channel based on subscriber count
 */
export const getChannelSize = (subscribers: number | null): ChannelSize => {
  if (!subscribers) return "small";
  
  if (subscribers >= 1_000_000) return "big";
  if (subscribers >= 100_000) return "larger";
  if (subscribers >= 10_000) return "established";
  if (subscribers >= 1_000) return "growing";
  return "small";
};

/**
 * Get the expected subscriber growth range based on channel size
 */
export const getGrowthRange = (size: ChannelSize): string => {
  switch (size) {
    case "big":
      return "10,000 - 50,000";
    case "larger":
      return "2,000 - 10,000";
    case "established":
      return "500 - 2,000";
    case "growing":
      return "100 - 500";
    case "small":
      return "10 - 100";
  }
};

/**
 * Calculate the average upload frequency (videos per week)
 */
export const calculateUploadFrequency = (startDate: string | null, videoCount: number | null): number | null => {
  if (!startDate || !videoCount) return null;

  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  return videoCount / diffWeeks;
};

/**
 * Categorize the upload frequency
 */
export const getUploadFrequencyCategory = (frequency: number | null): UploadFrequency => {
  if (!frequency || frequency <= 0.25) return "very_low";
  if (frequency <= 0.5) return "low";
  if (frequency <= 1) return "medium";
  if (frequency <= 2) return "high";
  if (frequency <= 3) return "very_high";
  return "insane";
};

/**
 * Format the upload frequency as a readable label
 */
export const getUploadFrequencyLabel = (frequency: number | null): string => {
  if (!frequency) return "N/A";
  const videosPerMonth = frequency * 4; // Convert weekly to monthly
  return `${frequency.toFixed(1)} videos/week (${Math.round(videosPerMonth)} per month)`;
};

/**
 * Format a date string
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
