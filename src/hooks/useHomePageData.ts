
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
  
  // Determine if we're in an error state
  const hasError = 
    (channelsQuery.isError && featuredQuery.isError) || // Both failed
    (channelsQuery.isError && channelsQuery.data?.channels?.length === 0) || // Main channels failed critically
    (channelsQuery.data?.channels?.length === 0 && !channelsQuery.isLoading && page === 1); // No channels on first page after loading
  
  // Generate appropriate error message if needed
  let errorMessage = null;
  if (hasError) {
    if (channelsQuery.error instanceof Error) {
      errorMessage = channelsQuery.error.message;
    } else if (featuredQuery.error instanceof Error) {
      errorMessage = featuredQuery.error.message;
    } else {
      errorMessage = 'Failed to load channels. Please try again later.';
    }
  }
  
  return {
    channels: channelsQuery.data?.channels || [],
    featuredChannels: featuredQuery.data || [],
    totalChannels: channelsQuery.data?.totalCount || 0,
    allVideos,
    isLoading: channelsQuery.isLoading || featuredQuery.isLoading,
    isError: hasError,
    error: errorMessage
  };
}
