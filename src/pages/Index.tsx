
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedVideos from '@/components/home/FeaturedVideos';
import ChannelSection from '@/components/home/ChannelSection';
import StatsSection from '@/components/home/StatsSection';
import ToolsSection from '@/components/home/ToolsSection';
import PageFooter from '@/components/home/PageFooter';
import ApiTester from '@/components/ApiTester'; // Add the import

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeroSection />
      <FeaturedVideos />
      <ChannelSection />
      <StatsSection />
      <ToolsSection />
      
      {/* Add the API tester */}
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">API Connection Testing</h2>
        <p className="text-gray-500 mb-6">Use this tool to test the Apify API connection.</p>
        <ApiTester />
      </div>
      
      <PageFooter />
    </div>
  );
};

export default Index;
