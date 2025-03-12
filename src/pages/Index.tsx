
import React, { useState, Suspense, lazy } from 'react';
import { useHomePageData } from '@/hooks/useHomePageData';
import HeroSection from '@/components/home/HeroSection';
import ToolsSection from '@/components/home/ToolsSection';
import PageFooter from '@/components/home/PageFooter';
import { Loader2 } from 'lucide-react';

// Lazy load non-critical components
const FeaturedVideos = lazy(() => import('@/components/home/FeaturedVideos'));
const ChannelSection = lazy(() => import('@/components/home/ChannelSection'));

// Loading component for suspense fallback
const SectionLoader = () => (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const channelsPerPage = 18; // 3 rows x 6 columns

  // Use the React Query hook for data fetching
  const { 
    channels, 
    featuredChannels, 
    allVideos, 
    totalChannels, 
    isLoading, 
    isError,
    error
  } = useHomePageData(currentPage, channelsPerPage);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefetch = () => {
    window.location.reload();
  };

  const errorMessage = error || (isError ? 'Failed to load channels. Please try again later.' : null);

  console.log("Current state:", { 
    channels: channels.length, 
    featuredChannels: featuredChannels.length,
    isLoading, 
    isError,
    error,
    errorMessage
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeroSection />
      
      {/* Only show videos if we have data and not in loading state */}
      {allVideos.length > 0 && !isLoading && (
        <Suspense fallback={<SectionLoader />}>
          <FeaturedVideos videos={allVideos} />
        </Suspense>
      )}
      
      <Suspense fallback={<SectionLoader />}>
        <ChannelSection 
          channels={channels}
          featuredChannels={featuredChannels}
          loading={isLoading}
          error={errorMessage}
          totalChannels={totalChannels}
          currentPage={currentPage}
          showFeatured={true}
          channelsPerPage={channelsPerPage}
          setCurrentPage={handlePageChange}
        />
      </Suspense>
      
      <ToolsSection />
      <PageFooter />
    </div>
  );
};

export default Index;
