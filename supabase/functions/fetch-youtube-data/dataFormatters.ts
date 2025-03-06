
/**
 * Format channel data consistently
 */
export function formatChannelData(channel: any, channelId: string) {
  const timestamp = new Date().toISOString();
  console.log(`📋 [${timestamp}] Formatting channel data for: ${channel.snippet.title}`);
  
  try {
    // Build a structured object with channel data
    const formattedData = {
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
      viewCount: parseInt(channel.statistics.viewCount || '0', 10),
      videoCount: parseInt(channel.statistics.videoCount || '0', 10),
      publishedAt: channel.snippet.publishedAt,
      country: channel.snippet.country || null,
      channelId: channelId,
      url: `https://www.youtube.com/channel/${channelId}`,
      channelType: guessChannelType(channel.snippet.title, channel.snippet.description),
      keywords: extractKeywords(channel.snippet.description || '')
    };
    
    console.log(`✅ [${timestamp}] Formatted channel data:`, JSON.stringify(formattedData, null, 2));
    return formattedData;
  } catch (error) {
    console.error(`❌ [${timestamp}] Error formatting channel data:`, error);
    throw new Error(`Error formatting channel data: ${error.message}`);
  }
}

/**
 * Guess channel type based on content
 */
export function guessChannelType(title: string, description: string) {
  const combined = (title + ' ' + description).toLowerCase();
  
  if (combined.includes('brand') || combined.includes('company') || combined.includes('business') || combined.includes('official')) {
    return 'brand';
  } else if (combined.includes('news') || combined.includes('report') || combined.includes('media')) {
    return 'media';
  } else {
    return 'creator'; // Default to creator
  }
}

/**
 * Extract potential keywords from description
 */
export function extractKeywords(description: string) {
  if (!description) return [];
  
  // Look for hashtags
  const hashtags = description.match(/#[\w\u00C0-\u017F]+/g) || [];
  const cleanHashtags = hashtags.map(tag => tag.substring(1));
  
  // Extract other potential keywords (words that repeat or are capitalized)
  const words = description
    .replace(/[^\w\s\u00C0-\u017F]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.trim());
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word.toLowerCase()] = (wordCount[word.toLowerCase()] || 0) + 1;
  });
  
  const frequentWords = Object.keys(wordCount)
    .filter(word => wordCount[word] > 1 || (word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 4))
    .slice(0, 10);
  
  // Combine hashtags and frequent words, remove duplicates
  const allKeywords = [...new Set([...cleanHashtags, ...frequentWords])];
  
  return allKeywords.slice(0, 15); // Limit to 15 keywords
}
