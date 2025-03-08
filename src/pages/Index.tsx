
import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturedVideos from '@/components/home/FeaturedVideos';
import ChannelSection from '@/components/home/ChannelSection';
import ToolsSection from '@/components/home/ToolsSection';
import PageFooter from '@/components/home/PageFooter';
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types/youtube';
import { toast } from "sonner";

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChannels, setTotalChannels] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const channelsPerPage = 18; // 3 rows x 6 columns

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        
        // Calculate offset based on current page
        const offset = (currentPage - 1) * channelsPerPage;
        
        // Fetch channels with pagination and random order
        const { data: channelsData, error: channelsError, count } = await supabase
          .from('youtube_channels')
          .select('*, videoStats:youtube_video_stats(*)', { count: 'exact' })
          .order('created_at', { ascending: false }) // Default ordering
          .range(offset, offset + channelsPerPage - 1);
          
        if (channelsError) throw channelsError;
        
        // Fetch featured channels
        const { data: featuredData, error: featuredError } = await supabase
          .from('youtube_channels')
          .select('*, videoStats:youtube_video_stats(*)')
          .eq('is_featured', true)
          .limit(3);
          
        if (featuredError) throw featuredError;
        
        // Type assertion to ensure the data conforms to Channel[]
        setChannels(channelsData as Channel[] || []);
        setFeaturedChannels(featuredData as Channel[] || []);
        setTotalChannels(count || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels. Please try again later.');
        toast.error('Failed to load channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannels();
  }, [currentPage, channelsPerPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    console.log(`Changing to page ${newPage}`);
    setCurrentPage(newPage);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        setCurrentPage={handlePageChange}
      />
      <ToolsSection />
      <PageFooter />
    </div>
  );
};

export default Index;
