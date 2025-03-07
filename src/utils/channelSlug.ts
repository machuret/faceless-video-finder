
import { Channel } from "@/types/youtube";

/**
 * Generates a slug for a channel based on its title and ID
 * @param channel The channel object or channel title
 * @param id Optional channel ID if only title is provided
 * @returns A URL-friendly slug
 */
export const generateChannelSlug = (channel: Channel | string, id?: string): string => {
  const title = typeof channel === 'string' ? channel : channel.channel_title;
  const channelId = typeof channel === 'string' ? id : channel.id;
  
  if (!title || !channelId) {
    console.error('Channel title or ID is missing');
    return '';
  }
  
  // Create a URL-friendly slug from the title
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  
  // Combine title slug with ID
  return `${titleSlug}-${channelId}`;
};
