
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelCategory } from "@/types/youtube";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import ChannelSearch from "@/components/home/ChannelSearch";
import ChannelGrid from "@/components/home/ChannelGrid";
import PageFooter from "@/components/home/PageFooter";
import HeroSection from "@/components/home/HeroSection";
import ToolsSection from "@/components/home/ToolsSection";
import StatsSection from "@/components/home/StatsSection";

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | "">("");

  useEffect(() => {
    fetchChannels();
  }, [selectedCategory]);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("youtube_channels")
        .select("*");

      if (selectedCategory) {
        query = query.eq("channel_category", selectedCategory as any);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setChannels(data as unknown as Channel[]);
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: ChannelCategory) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  const filteredChannels = channels.filter(channel => {
    const searchLower = searchTerm.toLowerCase();
    return (
      channel.channel_title?.toLowerCase().includes(searchLower) ||
      channel.description?.toLowerCase().includes(searchLower) ||
      channel.niche?.toLowerCase().includes(searchLower) ||
      (channel.keywords && channel.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      ))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />

      <main>
        <HeroSection />

        <div className="container mx-auto px-4 py-16">
          <ChannelSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            handleCategorySelect={handleCategorySelect}
            channelCount={filteredChannels.length}
          />

          <ChannelGrid 
            channels={filteredChannels}
            loading={loading}
            resetFilters={resetFilters}
          />
          
          <div className="my-20"></div>
          
          <ToolsSection />
        </div>
        
        <StatsSection />
      </main>

      <PageFooter />
    </div>
  );
};

export default Index;
