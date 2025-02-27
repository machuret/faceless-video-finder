
import { ChannelCategory, ChannelType, ChannelSize, UploadFrequency } from "@/types/youtube";

export const channelCategories: ChannelCategory[] = [
  "entertainment",
  "education",
  "gaming",
  "music",
  "news",
  "sports",
  "technology",
  "other"
];

export const channelTypes: ChannelType[] = [
  "creator",
  "brand",
  "media",
  "other"
];

export const channelSizes: ChannelSize[] = [
  "small",
  "growing",
  "established",
  "larger",
  "big"
];

export const uploadFrequencies: UploadFrequency[] = [
  "very_low",
  "low",
  "medium",
  "high",
  "very_high",
  "insane"
];
