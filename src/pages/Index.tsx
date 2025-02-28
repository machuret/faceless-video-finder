
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ExternalLink } from "lucide-react";
import { 
  channelCategories 
} from "@/components/youtube/channel-list/constants";
import { Channel, ChannelCategory, VideoStats } from "@/types/youtube";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import VideoCard from "@/components/youtube/VideoCard";
import MainNavbar from "@/components/MainNavbar";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is done in the filtered channels computed value
  };

  const handleCategorySelect = (category: ChannelCategory) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
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
      {/* Sticky Navigation Bar */}
      <MainNavbar />

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="font-crimson text-2xl font-bold mb-4 text-gray-800">Find YouTube Channels</h2>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-montserrat"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-montserrat">
              Search
            </Button>
          </form>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <h3 className="font-montserrat text-base font-semibold text-gray-700">Filter by Category</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {channelCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category as ChannelCategory)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors font-montserrat ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-montserrat text-lg font-semibold mb-2 text-gray-800">
              {selectedCategory 
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Channels`
                : "All Channels"}
            </h2>
            <p className="font-lato text-gray-600">
              {filteredChannels.length} {filteredChannels.length === 1 ? "channel" : "channels"} found
            </p>
          </div>
        </div>

        {/* Channel Cards Section */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium font-montserrat">Loading channels...</p>
          </div>
        ) : filteredChannels.length > 0 ? (
          <div>
            {/* Channel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChannels.map((channel) => (
                <Card key={channel.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                  <Link to={`/channel/${channel.id}`} className="flex-grow">
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      {channel.screenshot_url ? (
                        <img 
                          src={channel.screenshot_url} 
                          alt={channel.channel_title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <p className="text-gray-400 font-lato">No screenshot</p>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-crimson text-lg font-semibold mb-2 line-clamp-1">{channel.channel_title}</h3>
                      <div className="flex items-center gap-x-4 text-sm text-gray-500 mb-3 font-montserrat">
                        <div className="flex items-center">
                          <span className="font-medium">{channel.total_subscribers ? parseInt(channel.total_subscribers.toString()).toLocaleString() : '0'}</span>
                          <span className="ml-1">subscribers</span>
                        </div>
                        <div>
                          <span className="font-medium">{channel.total_views ? parseInt(channel.total_views.toString()).toLocaleString() : '0'}</span>
                          <span className="ml-1">views</span>
                        </div>
                      </div>
                      <p className="font-lato text-gray-600 line-clamp-2 text-sm mb-2">
                        {channel.description || "No description available"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {channel.niche && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-montserrat">
                            {channel.niche}
                          </span>
                        )}
                        {channel.channel_category && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-montserrat">
                            {channel.channel_category}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                  
                  {/* New Visit Channel Button */}
                  <div className="p-4 mt-auto border-t bg-gray-50">
                    <a 
                      href={channel.channel_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full"
                    >
                      <Button variant="default" size="default" className="w-full bg-red-600 hover:bg-red-700 font-medium">
                        <ExternalLink className="mr-2 h-4 w-4" /> Visit this Channel
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            {/* Featured Videos Section */}
            {channels.some(channel => channel.videoStats && channel.videoStats.length > 0) && (
              <div className="mt-12">
                <h2 className="font-crimson text-2xl font-bold mb-6 text-gray-800">Featured Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {channels
                    .filter(channel => channel.videoStats && channel.videoStats.length > 0)
                    .flatMap(channel => channel.videoStats || [])
                    .slice(0, 6)
                    .map((video: VideoStats) => (
                      <VideoCard
                        key={video.video_id}
                        title={video.title || "Untitled Video"}
                        video_id={video.video_id}
                        thumbnail_url={video.thumbnail_url || ""}
                        stats={`${video.views?.toLocaleString() || 0} views`}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg font-lato">No channels found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4 font-montserrat"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 font-lato">
          <p>YouTube Channel Explorer - Find and discover content creators</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
