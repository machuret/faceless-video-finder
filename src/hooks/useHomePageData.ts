
import { useFeaturedChannels, useHomePageChannels, usePrefetchNextPage, useVideosFromChannels } from './homepage';

/**
 * Main hook for fetching homepage data
 * This has been refactored into smaller, more focused components
 */
export function useHomePageData(page: number, channelsPerPage: number) {
  // Prefetch next page
  usePrefetchNextPage(page, channelsPerPage);
  
  // Get featured channels
  const featuredQuery = useFeaturedChannels();
  
  // Get main channel data for current page
  const channelsQuery = useHomePageChannels(page, channelsPerPage);
  
  // Extract all videos using memoization
  const allVideos = useVideosFromChannels(channelsQuery.data?.channels || []);
  
  return {
    channels: channelsQuery.data?.channels || [],
    featuredChannels: featuredQuery.data || [],
    totalChannels: channelsQuery.data?.totalCount || 0,
    allVideos,
    isLoading: channelsQuery.isLoading || featuredQuery.isLoading,
    isError: channelsQuery.isError || featuredQuery.isError,
    error: channelsQuery.error ? 
      (channelsQuery.error instanceof Error ? channelsQuery.error.message : 'Failed to load channels') 
      : featuredQuery.error ? 'Failed to load featured channels' : null
  };
}
