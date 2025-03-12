
/**
 * This file is maintained for backward compatibility.
 * New code should import directly from the modular files in src/services/channel/
 */
import { 
  fetchChannelDetails,
  fetchTopPerformingVideos,
  fetchRelatedChannels 
} from './channel';

// Re-export for backward compatibility
export {
  fetchChannelDetails,
  fetchTopPerformingVideos,
  fetchRelatedChannels
};
