/**
 * Normalizes a YouTube URL or search term
 */
export function normalizeYouTubeUrl(input: string): string {
  // If it's a full URL, return it
  if (input.includes('youtube.com/') || input.includes('youtu.be/')) {
    // Make sure it has about page for channel URLs to get full info
    if (input.includes('/channel/') && !input.includes('/about')) {
      return `${input.replace(/\/$/, '')}/about`;
    }
    // For handle URLs, add about section
    if (input.includes('/@') && !input.includes('/about')) {
      return `${input.replace(/\/$/, '')}/about`;
    }
    return input;
  }
  
  // If it's a handle (starts with @), convert to full URL
  if (input.startsWith('@')) {
    return `https://www.youtube.com/${input}/about`;
  }
  
  // If it looks like a channel ID (starts with UC)
  if (/^UC[\w-]{21,24}$/.test(input)) {
    return `https://www.youtube.com/channel/${input}/about`;
  }
  
  // Otherwise treat as a search term
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
}

/**
 * Extract title from URL for better mock data
 */
export function extractTitleFromUrl(url: string): string {
  if (url.includes('@')) {
    return url.split('@')[1].split('/')[0].split('?')[0].replace(/[-_]/g, ' ');
  }
  
  const lastSegment = url.split('/').pop();
  if (lastSegment) {
    return lastSegment.replace(/[-_]/g, ' ');
  }
  
  return "";
}
