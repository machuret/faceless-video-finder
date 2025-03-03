
import { useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import HeroSection from "@/components/home/HeroSection";
import ToolsSection from "@/components/home/ToolsSection";
import StatsSection from "@/components/home/StatsSection";
import PageFooter from "@/components/home/PageFooter";
import ChannelSection from "@/components/home/ChannelSection";
import { useChannels } from "@/hooks/channels/useChannels";

const Index = () => {
  const {
    channels,
    featuredChannels,
    loading,
    error,
    totalChannels,
    currentPage,
    showFeatured,
    setCurrentPage,
    fetchChannels,
    fetchFeaturedChannels,
    CHANNELS_PER_PAGE,
  } = useChannels();

  useEffect(() => {
    console.log("Index page: Fetching channels...");
    fetchChannels("", currentPage);
    fetchFeaturedChannels();
  }, [currentPage, fetchChannels, fetchFeaturedChannels]);

  console.log("Index page render:", { 
    channelsCount: channels.length,
    featuredCount: featuredChannels.length,
    loading,
    error
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />

      <main>
        <HeroSection />
        
        <ChannelSection 
          channels={channels}
          featuredChannels={featuredChannels}
          loading={loading}
          error={error}
          totalChannels={totalChannels}
          currentPage={currentPage}
          showFeatured={showFeatured}
          channelsPerPage={CHANNELS_PER_PAGE}
          setCurrentPage={setCurrentPage}
        />
        
        <div className="my-20"></div>
        
        <ToolsSection />
        <StatsSection />
      </main>

      <PageFooter />
    </div>
  );
};

export default Index;
