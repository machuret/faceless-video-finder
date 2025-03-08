
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [channelCount, setChannelCount] = useState<number>(0);

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

  return (
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
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-xl">
            <Input 
              type="text" 
              placeholder="Search for niches, channels, or keywords..." 
              className="py-6 pr-12 pl-4 rounded-lg text-black border-2 border-white focus:border-yellow-300"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
