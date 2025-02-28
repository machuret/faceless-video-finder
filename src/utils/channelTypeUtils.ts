
import type { DatabaseChannelType } from "@/types/youtube";

/**
 * Convert a UI channel type to the appropriate database channel type
 */
export const mapToDatabaseChannelType = (uiChannelType: string | undefined): DatabaseChannelType => {
  if (uiChannelType === "creator" || uiChannelType === "brand" || uiChannelType === "media") {
    return uiChannelType;
  }
  return "other";
};
