
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import SearchBar from "@/components/common/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const HeroSection = () => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const navigate = useNavigate();

  // Use React Query to fetch and cache channel count
  const { data: channelCount = 0, isLoading: isCountLoading } = useQuery({
    queryKey: ['channelCount'],
    queryFn: async () => {
      try {
        console.log("Fetching channel count from database");
        const { count, error } = await supabase
          .from('youtube_channels')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error("Error fetching channel count:", error);
          throw error;
        }
        
        console.log("Channel count from database:", count);
        return count || 0;
      } catch (err) {
        console.error('Error fetching channel count:', err);
        return 0;
      }
    },
    staleTime: 60 * 1000, // Cache for 1 minute (shorter time to ensure more accurate counts)
  });

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      toast.info("Please enter a search term");
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Navigate to the search page with the search query as a parameter
      navigate(`/channels?search=${encodeURIComponent(trimmedQuery)}`);
    } catch (err) {
      console.error("Navigation error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Memoize formatted count to avoid re-calculations
  const formattedCount = useMemo(() => {
    return channelCount.toLocaleString();
  }, [channelCount]);

  return (
    <>
      <MainNavbar />
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="font-crimson text-5xl md:text-6xl font-bold mb-6">
            Find YouTube Faceless Channels
          </h1>
          <p className="text-xl mb-2 text-blue-100 max-w-3xl mx-auto">
            Faceless Finder helps you find trending niches, estimate earnings, and analyze growth potential
            all in one place. Start your faceless YouTube journey today.
          </p>
          <p className="text-sm mb-8 text-blue-200">
            {isCountLoading ? "Loading channel count..." : `So far ${formattedCount} YouTube Channels Indexed`}
          </p>
          
          <div className="max-w-xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search for niches, channels, or keywords..."
              showClearButton={true}
              autoSubmit={false}
              className="mb-6"
              inputClassName="py-6 pr-12 pl-12 rounded-lg text-black border-2 border-white focus:border-yellow-300"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
