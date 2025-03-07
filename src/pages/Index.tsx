
import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedVideos from '@/components/home/FeaturedVideos';
import ChannelSection from '@/components/home/ChannelSection';
import ToolsSection from '@/components/home/ToolsSection';
import PageFooter from '@/components/home/PageFooter';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChannels, setTotalChannels] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const channelsPerPage = 9;

  // This is just a simple placeholder implementation to fix type errors
  // In a real implementation, you would fetch actual data from your API
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        
        // Simulate fetching channels
        const { data: channelsData, error: channelsError } = await supabase
          .from('youtube_channels')
          .select('*')
          .limit(channelsPerPage);
          
        if (channelsError) throw channelsError;
        
        // Simulate fetching featured channels
        const { data: featuredData, error: featuredError } = await supabase
          .from('youtube_channels')
          .select('*')
          .eq('is_featured', true)
          .limit(3);
          
        if (featuredError) throw featuredError;
        
        // Simulate fetching total count
        const { count, error: countError } = await supabase
          .from('youtube_channels')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        // Type assertion to ensure the data conforms to Channel[]
        setChannels(channelsData as Channel[] || []);
        setFeaturedChannels(featuredData as Channel[] || []);
        setTotalChannels(count || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannels();
  }, [currentPage]);

  // Extract all videos from the channels for the FeaturedVideos component
  const allVideos = [...channels, ...featuredChannels]
    .flatMap(channel => channel.videoStats || [])
    .filter(video => video !== undefined);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HeroSection />
      <FeaturedVideos videos={allVideos} />
      <ChannelSection 
        channels={channels}
        featuredChannels={featuredChannels}
        loading={loading}
        error={error}
        totalChannels={totalChannels}
        currentPage={currentPage}
        showFeatured={true}
        channelsPerPage={channelsPerPage}
        setCurrentPage={setCurrentPage}
      />
      <ToolsSection />
      <PageFooter />
    </div>
  );
};

export default Index;
