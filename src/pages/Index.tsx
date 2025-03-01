import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelCategory } from "@/types/youtube";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import ChannelSearch from "@/components/home/ChannelSearch";
import ChannelGrid from "@/components/home/ChannelGrid";
import PageFooter from "@/components/home/PageFooter";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, TrendingUp, Users, Video, DollarSign } from "lucide-react";
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h1 className="font-crimson text-5xl md:text-6xl font-bold mb-6">
              Discover and grow your<br />
              <span className="text-yellow-300">faceless YouTube channel</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Find trending niches, estimate earnings, and analyze growth potential
              all in one place. Start your faceless YouTube journey today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <Link to="/calculators">
                <Button className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-6 rounded-lg text-lg font-medium flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Explore Creator Tools
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="font-crimson text-3xl font-bold mb-4 text-gray-800">Tools for YouTube Creators</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to research, plan, and grow your channel
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-crimson text-xl font-bold mb-2">Earnings Calculator</h3>
                <p className="text-gray-600 mb-4">Estimate your YouTube revenue based on views and engagement</p>
                <Link to="/calculator" className="text-blue-600 font-medium flex items-center hover:underline">
                  Try it now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-crimson text-xl font-bold mb-2">Growth Analyzer</h3>
                <p className="text-gray-600 mb-4">Track and predict your subscriber growth over time</p>
                <Link to="/growth-calculator" className="text-blue-600 font-medium flex items-center hover:underline">
                  Try it now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-purple-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-crimson text-xl font-bold mb-2">Channel Valuation</h3>
                <p className="text-gray-600 mb-4">Estimate the market value of your YouTube channel</p>
                <Link to="/reach-calculator" className="text-blue-600 font-medium flex items-center hover:underline">
                  Try it now <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link to="/calculators">
                <Button variant="outline" className="font-montserrat">
                  View All Tools <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
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
        </div>
        
        <div className="bg-blue-800 text-white py-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-crimson text-3xl font-bold">The Platform for YouTube Creators</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-3xl font-bold mb-1">2,500+</p>
                <p className="text-blue-200">Channel Ideas</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Video className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-3xl font-bold mb-1">15+</p>
                <p className="text-blue-200">Niches</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <DollarSign className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-3xl font-bold mb-1">$250K+</p>
                <p className="text-blue-200">Earnings Potential</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-blue-300" />
                </div>
                <p className="text-3xl font-bold mb-1">10M+</p>
                <p className="text-blue-200">Views Analyzed</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
};

export default Index;
