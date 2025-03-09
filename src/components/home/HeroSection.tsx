
import { useState, useEffect } from "react";
import { Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HeroSection = () => {
  const [channelCount, setChannelCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const navigate = useNavigate();

  // Fetch the total number of channels
  useEffect(() => {
    const fetchChannelCount = async () => {
      try {
        const { count, error } = await supabase
          .from('youtube_channels')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        setChannelCount(count || 0);
      } catch (err) {
        console.error('Error fetching channel count:', err);
      }
    };
    
    fetchChannelCount();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // If it looks like a YouTube channel URL with a Channel ID (UC...), provide a warning
      if (searchQuery.includes('youtube.com/channel/')) {
        const channelIdMatch = searchQuery.match(/youtube\.com\/channel\/([^\/\s?&]+)/i);
        if (channelIdMatch && channelIdMatch[1]) {
          const channelId = channelIdMatch[1];
          
          // Check if the ID is lowercase but should be uppercase (common issue with UC... IDs)
          if (channelId.startsWith('uc') && channelId !== channelId.toUpperCase()) {
            toast.warning("YouTube channel IDs are case-sensitive. If you're having trouble, try using uppercase 'UC' instead of 'uc'.", {
              duration: 6000,
            });
          }
        }
      }
      
      // Fix: Use correct route for search results
      navigate(`/channels?search=${encodeURIComponent(searchQuery.trim())}`);
    } finally {
      setIsSearching(false);
    }
  };

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
            So far {channelCount.toLocaleString()} YouTube Channels Indexed
          </p>
          <form onSubmit={handleSearch} className="flex justify-center mb-6">
            <div className="relative w-full max-w-xl">
              <Input 
                type="text" 
                placeholder="Search for niches, channels, or keywords..." 
                className="py-6 pr-12 pl-4 rounded-lg text-black border-2 border-white focus:border-yellow-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer"
              >
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </form>
          <div className="text-sm text-blue-200 mt-2">
            <div className="flex justify-center items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>For YouTube channel URLs, case matters! Example: UC... not uc...</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
