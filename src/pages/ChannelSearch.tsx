
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchChannel } from '@/utils/channelSearch';
import ChannelSection from '@/components/home/ChannelSection';
import MainNavbar from '@/components/MainNavbar';
import PageFooter from '@/components/home/PageFooter';
import { Channel } from '@/types/youtube';
import { toast } from "sonner";
import LoadingState from '@/components/home/LoadingState';

const ChannelSearch = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const channelsPerPage = 18;

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery) {
        setChannels([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log("Searching for:", searchQuery);
        const results = await searchChannel(searchQuery);
        console.log("Search results:", results);
        setChannels(results);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to perform search. Please try again.');
        toast.error('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {loading ? 'Searching...' : `Search Results: ${searchQuery}`}
        </h1>
        
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <p>{error}</p>
              </div>
            )}
            
            {!error && channels.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded mb-6 text-center">
                <p className="text-lg font-semibold">No channels found for "{searchQuery}"</p>
                <p className="mt-2">Try using different keywords or check the spelling.</p>
              </div>
            )}
            
            {channels.length > 0 && (
              <ChannelSection 
                channels={channels}
                featuredChannels={[]}
                loading={false}
                error={null}
                totalChannels={channels.length}
                currentPage={currentPage}
                showFeatured={false}
                channelsPerPage={channelsPerPage}
                setCurrentPage={handlePageChange}
              />
            )}
          </>
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelSearch;
