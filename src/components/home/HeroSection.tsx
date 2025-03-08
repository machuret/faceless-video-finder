
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";

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
    <>
      <MainNavbar />
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <p className="text-xl mb-2 text-blue-100 max-w-3xl mx-auto">
            Faceless Finder helps you find trending niches, estimate earnings, and analyze growth potential
            all in one place. Start your faceless YouTube journey today.
          </p>
          <p className="text-sm mb-8 text-blue-200">
            So far {channelCount.toLocaleString()} YouTube Channels Indexed
          </p>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
