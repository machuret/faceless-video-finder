
import React, { useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedVideos from '@/components/home/FeaturedVideos';
import ChannelSection from '@/components/home/ChannelSection';
import ToolsSection from '@/components/home/ToolsSection';
import PageFooter from '@/components/home/PageFooter';
import { useHomePageData } from '@/hooks/useHomePageData';

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const channelsPerPage = 18; // 3 rows x 6 columns

  // Use the new React Query hook for data fetching
  const { 
    channels, 
    featuredChannels, 
    allVideos, 
    totalChannels, 
    isLoading, 
    isError 
  } = useHomePageData(currentPage, channelsPerPage);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const error = isError ? 'Failed to load channels. Please try again later.' : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeroSection />
      
      {/* Only show videos if we have data and not in loading state */}
      {allVideos.length > 0 && !isLoading && (
        <FeaturedVideos videos={allVideos} />
      )}
      
      <ChannelSection 
        channels={channels}
        featuredChannels={featuredChannels}
        loading={isLoading}
        error={error}
        totalChannels={totalChannels}
        currentPage={currentPage}
        showFeatured={true}
        channelsPerPage={channelsPerPage}
        setCurrentPage={handlePageChange}
      />
      
      <ToolsSection />
      <PageFooter />
    </div>
  );
};

export default Index;
