
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelCategory } from "@/types/youtube";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import ChannelSearch from "@/components/home/ChannelSearch";
import ChannelGrid from "@/components/home/ChannelGrid";
import PageFooter from "@/components/home/PageFooter";
import { Link } from "react-router-dom";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      // Cast the data to ensure it matches the Channel type
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

  // Filter channels based on search term
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

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="font-crimson text-2xl font-bold mb-2 text-gray-800">YouTube Analytics Tools</h2>
            <p className="text-gray-600 mb-4 md:mb-0">Access our collection of calculators for YouTube creators</p>
          </div>
          <Link to="/calculators">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              View Creator Tools
            </Button>
          </Link>
        </div>
        
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
      </main>

      <PageFooter />
    </div>
  );
};

export default Index;
