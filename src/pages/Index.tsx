
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  channelCategories 
} from "@/components/youtube/channel-list/constants";
import { Channel } from "@/types/youtube";
import { 
  ChannelList 
} from "@/components/youtube/ChannelList";
import { 
  formatDate,
  getChannelSize,
  getGrowthRange,
  calculateUploadFrequency,
  getUploadFrequencyCategory,
  getUploadFrequencyLabel
} from "@/utils/channelUtils";
import { toast } from "sonner";

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [generatingContent, setGeneratingContent] = useState(false);
  const navigate = useNavigate();

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
        query = query.eq("channel_category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setChannels(data || []);
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const handleGenerateContent = async (channel: Channel) => {
    setGeneratingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { channelId: channel.id }
      });

      if (error) throw error;

      if (data?.description) {
        // Update the local state
        setChannels(channels.map(c => {
          if (c.id === channel.id) {
            return { ...c, description: data.description };
          }
          return c;
        }));

        // Update the database
        const { error: updateError } = await supabase
          .from('youtube_channels')
          .update({ description: data.description })
          .eq('id', channel.id);

        if (updateError) throw updateError;

        toast.success("Generated content successfully");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChannels(channels.filter(channel => channel.id !== id));
      toast.success("Channel deleted successfully");
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast.error("Failed to delete channel");
    }
  };

  const handleSave = async (updatedChannel: Channel) => {
    try {
      const { error } = await supabase
        .from('youtube_channels')
        .update(updatedChannel)
        .eq('id', updatedChannel.id);

      if (error) throw error;

      setChannels(channels.map(channel => 
        channel.id === updatedChannel.id ? updatedChannel : channel
      ));
      toast.success("Channel updated successfully");
    } catch (error) {
      console.error("Error updating channel:", error);
      toast.error("Failed to update channel");
    }
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">YouTube Channel Database</h1>
        <div className="flex gap-2">
          <Link to="/channel-types">
            <Button variant="outline">View Channel Types</Button>
          </Link>
          <Link to="/admin/login">
            <Button>Admin Login</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            {channelCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">
            {selectedCategory 
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Channels`
              : "All Channels"}
          </h2>
          <p className="text-gray-600 mb-4">
            {filteredChannels.length} {filteredChannels.length === 1 ? "channel" : "channels"} found
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading channels...</div>
      ) : filteredChannels.length > 0 ? (
        <ChannelList
          channels={filteredChannels}
          onDelete={handleDelete}
          onSave={handleSave}
          onGenerateContent={handleGenerateContent}
          generatingContent={generatingContent}
          getChannelSize={getChannelSize}
          getGrowthRange={getGrowthRange}
          calculateUploadFrequency={calculateUploadFrequency}
          getUploadFrequencyCategory={getUploadFrequencyCategory}
          getUploadFrequencyLabel={getUploadFrequencyLabel}
          formatDate={formatDate}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No channels found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Index;
