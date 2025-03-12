
import { useFeaturedChannels, useHomePageChannels, usePrefetchNextPage, useVideosFromChannels } from './homepage';

export function useHomePageData(page: number, channelsPerPage: number) {
  // Prefetch next page early
  usePrefetchNextPage(page, channelsPerPage);
  
  // Get featured channels with optimized caching
  const featuredQuery = useFeaturedChannels();
  
  // Get main channel data for current page with parallel loading
  const channelsQuery = useHomePageChannels(page, channelsPerPage);
  
  // Extract videos using memoization for performance
  const allVideos = useVideosFromChannels(channelsQuery.data?.channels || []);
  
  // Determine error state with improved error handling
  const hasError = (
    (channelsQuery.isError && featuredQuery.isError) ||
    (channelsQuery.isError && channelsQuery.data?.channels?.length === 0) ||
    (channelsQuery.data?.channels?.length === 0 && !channelsQuery.isLoading && page === 1)
  );
  
  // Generate appropriate error message
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
    error: errorMessage,
    // Add loading states for better UI handling
    isFeaturedLoading: featuredQuery.isLoading,
    isChannelsLoading: channelsQuery.isLoading,
  };
}
