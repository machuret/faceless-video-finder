
import { ChannelSize, UploadFrequency } from "@/types/youtube";

export const getChannelSize = (subscribers: number | null): ChannelSize => {
  if (!subscribers) return "small";
  if (subscribers >= 1_000_000) return "big";
  if (subscribers >= 100_000) return "larger";
  if (subscribers >= 10_000) return "established";
  if (subscribers >= 1_000) return "growing";
  return "small";
};

export const getGrowthRange = (size: ChannelSize): string => {
  switch (size) {
    case "big": return "10,000 - 50,000";
    case "larger": return "2,000 - 10,000";
    case "established": return "500 - 2,000";
    case "growing": return "100 - 500";
    case "small": return "10 - 100";
  }
};

export const calculateUploadFrequency = (startDate: string | null, videoCount: number | null): number | null => {
  if (!startDate || !videoCount) return null;
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return videoCount / diffWeeks;
};

export const getUploadFrequencyCategory = (frequency: number | null): UploadFrequency => {
  if (!frequency || frequency <= 0.25) return "very_low";
  if (frequency <= 0.5) return "low";
  if (frequency <= 1) return "medium";
  if (frequency <= 2) return "high";
  if (frequency <= 3) return "very_high";
  return "insane";
};

export const getUploadFrequencyLabel = (frequency: number | null): string => {
  if (!frequency) return "N/A";
  const videosPerMonth = frequency * 4;
  return `${frequency.toFixed(1)} videos/week (${Math.round(videosPerMonth)} per month)`;
};

export const formatRevenue = (amount: number | null) => {
  if (!amount) return '$0';
  return `$${Math.round(amount)}`;
};

export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Creates a URL-friendly slug for a channel, combining channel title with ID
 */
export const getChannelSlug = (channel: { channel_title: string; id: string }): string => {
  if (!channel || !channel.channel_title) return `channel-${channel.id}`;
  
  // Convert the title to lowercase and replace spaces and special characters with hyphens
  const titleSlug = channel.channel_title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  
  // Return a slug that includes both the title and ID
  return `${titleSlug}-${channel.id}`;
};

// Add countries list for dropdown
export const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "KR", name: "South Korea" },
  { code: "RU", name: "Russia" },
  { code: "CN", name: "China" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "SG", name: "Singapore" },
  { code: "PH", name: "Philippines" },
  { code: "MY", name: "Malaysia" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "TR", name: "Turkey" },
  { code: "EG", name: "Egypt" },
  { code: "IL", name: "Israel" },
  { code: "NZ", name: "New Zealand" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "PT", name: "Portugal" },
  { code: "IE", name: "Ireland" },
  { code: "GR", name: "Greece" },
  { code: "Other", name: "Other" }
];
