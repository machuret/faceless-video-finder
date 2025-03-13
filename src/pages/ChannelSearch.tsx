
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchChannel } from '@/utils/channelSearch';
import ChannelSection from '@/components/home/ChannelSection';
import MainNavbar from '@/components/MainNavbar';
import PageFooter from '@/components/home/PageFooter';
import { Channel } from '@/types/youtube';
import { toast } from "sonner";
import LoadingState from '@/components/home/LoadingState';
import SearchBar from '@/components/common/SearchBar';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ChannelSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
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
        
        if (results && Array.isArray(results)) {
          setChannels(results);
          if (results.length === 0) {
            // Not an error, just no results
            console.log("No results found for:", searchQuery);
          }
        } else {
          throw new Error("Invalid search results format");
        }
      } catch (err: any) {
        console.error('Search error:', err);
        const errorMessage = err?.message || 'Failed to perform search. Please try again.';
        setError(errorMessage);
        toast.error('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      toast.info("Please enter a search term");
      return;
    }
    
    setSearchParams({ search: query });
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get paginated channels
  const getPaginatedChannels = () => {
    const startIndex = (currentPage - 1) * channelsPerPage;
    const endIndex = startIndex + channelsPerPage;
    return channels.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(channels.length / channelsPerPage);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {loading ? 'Searching...' : searchQuery ? `Search Results: ${searchQuery}` : 'Search Channels'}
        </h1>
        
        <div className="mb-6">
          <SearchBar
            initialQuery={searchQuery}
            onSearch={handleSearch}
            placeholder="Search for channels, niches, or keywords..."
            autoSubmit={false}
            className="max-w-xl mx-auto"
          />
        </div>
        
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!error && channels.length === 0 && searchQuery && (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded mb-6 text-center">
                <p className="text-lg font-semibold">No channels found for "{searchQuery}"</p>
                <p className="mt-2">Try using different keywords or check the spelling.</p>
              </div>
            )}
            
            {channels.length > 0 && (
              <ChannelSection 
                channels={getPaginatedChannels()}
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
